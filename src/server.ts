import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";

import { createStore } from "./data/storefactory.js";
import { contextMiddleware } from "./middleware/context.js";
import { accessControlMiddleware } from "./middleware/accesscontrol.js";
import { requireTenantHeader } from "./middleware/requiretenant.js";

import eventsRoute from "./routes/events.js";
import utilizationRoute from "./routes/utilization.js";
import recommendRoute from "./routes/recommend.js";
import queryRoute from "./routes/query.js";
import baseRoutes from "./routes/baseroutes.js";

// 🗃 Initialize the SQLite or InMemory store
const store = createStore();
if ("seed" in store && typeof (store as any).seed === "function") {
  try {
    (store as any).seed();
  } catch (err) {
    console.error("⚠️  Store seeding failed:", err);
  }
}

const app = express();

// 🌐 Core middleware
app.use(morgan("dev"));

// 🌐 CORS Configuration (handles localhost, Render, and dynamic GitHub Codespaces)
const allowedOrigins = [
  "http://localhost:8080",                             // Local
  "https://saltmine-prototype.onrender.com"            // Render Deployment
];

app.use(cors({
  origin: (origin, callback) => {
    try {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /\.app\.github\.dev$/.test(new URL(origin).hostname) // Any Codespace
      ) {
        callback(null, true);
      } else {
        console.warn(`🚫 Blocked CORS request from: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    } catch {
      callback(null, true);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-tenant-id", "x-user-role", "x-user-region"],
  exposedHeaders: ["Content-Length", "x-tenant-id"],
  credentials: true,
  optionsSuccessStatus: 204
}));

app.use(express.json());

// 🩺 Healthcheck & Base routes FIRST (no tenant header required)
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/", (_req, res) => {
  res.send("✅ Saltmine Prototype API is running. Visit /api-docs for Swagger UI.");
});
app.use(baseRoutes);

// 📘 Swagger setup (must be defined BEFORE tenant enforcement)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerPath = path.join(__dirname, "..", "docs", "swagger.yaml");
const swaggerDocument = YAML.load(swaggerPath);

// Handle both local (/api-docs) and hosted (/swagger-ui) paths
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/swagger-ui", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 🔐 Tenant enforcement (applies only after exempt routes)
app.use(requireTenantHeader);

// 🔐 Context & Access Control (RBAC)
app.use(contextMiddleware);
app.use(accessControlMiddleware);

// 🧩 Compatibility Aliases for all major endpoints
// -----------------------------------------------------
// These allow Swagger/Jest to call singular endpoints
// even if the Express route uses plural names internally.

// /event → /events
app.all(/^\/event(\/.*)?$/, (req, res, next) => {
  req.url = req.url.replace(/^\/event/, "/events");
  next();
});

// /utilization → /utilizations
app.all(/^\/utilization(\/.*)?$/, (req, res, next) => {
  req.url = req.url.replace(/^\/utilization/, "/utilizations");
  next();
});

// /recommend → /recommendations
app.all(/^\/recommend(\/.*)?$/, (req, res, next) => {
  req.url = req.url.replace(/^\/recommend/, "/recommendations");
  next();
});

// 🧪 Test-only endpoint for seed injection (bypasses RBAC for testing)
app.post("/test-event", (req, res) => {
  try {
    const parsed = req.body;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.tenant_id ||
      !parsed.room_id ||
      !parsed.timestamp
    ) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    if ("addEvent" in store && typeof (store as any).addEvent === "function") {
      (store as any).addEvent(parsed.tenant_id, parsed);
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("❌ /test-event error:", err);
    return res.status(500).json({ error: "Failed to store test event" });
  }
});

// 🧭 Primary protected routes (tenant header required)
app.use("/events", eventsRoute);
app.use("/utilizations", utilizationRoute);
app.use("/recommendations", recommendRoute);
app.use("/", queryRoute);

// ⚙️ Optional: /whoami endpoint for RBAC / Tenant debugging
app.get("/whoami", (req, res) => {
  const ctx = (req as any).accessContext || {};
  res.json({
    message: "Resolved Access Context",
    tenant: ctx.tenant || "unknown",
    role: ctx.role || "unknown",
    region: ctx.region || "unknown"
  });
});

// ⚠️ Catch-all 404 for undefined routes
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

export default app;

// 🚀 Launch server (except during test runs)
if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT || 8080);
  app.listen(port, () => {
    console.log(`Saltmine Prototype API listening on port ${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
  });
}
