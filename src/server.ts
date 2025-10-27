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

import eventsRoute from "./routes/events.js";
import utilizationRoute from "./routes/utilization.js";
import recommendRoute from "./routes/recommend.js";
import queryRoute from "./routes/query.js";

// 🗃 Initialize store
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
app.use(cors());
app.use(express.json());

// 🔐 Access control and context should wrap all routes
app.use(contextMiddleware);
app.use(accessControlMiddleware);

/**
 * 🧪 Dedicated test-only route — avoids conflict with /events
 */
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
    } else {
      console.warn("⚠️  store.addEvent not implemented — skipping insert");
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("❌ Direct /test-event alias error:", err);
    return res.status(500).json({ error: "Failed to store event" });
  }
});

/**
 * 📘 Swagger setup
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerPath = path.join(__dirname, "..", "docs", "swagger.yaml");
const swaggerDocument = YAML.load(swaggerPath);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**
 * 🧭 Routes
 */
app.use("/events", eventsRoute);
app.use("/utilization", utilizationRoute);
app.use("/recommend", recommendRoute);
app.use("/", queryRoute);

/**
 * 🩺 Health check
 */
app.get("/health", (_req, res) => res.json({ status: "ok" }));

/**
 * 🏠 Root info
 */
app.get("/", (_req, res) => {
  res.send("✅ Saltmine Prototype API is running. Visit /api-docs for Swagger UI.");
});

/**
 * 🚀 Production extensions
 * - Add proper DI for store + auth modules
 * - Add caching layer (Redis)
 * - Add telemetry exporter
 */

export default app;

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT || 8080);
  app.listen(port, () => {
    console.log(`Saltmine Prototype API listening on port ${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
  });
}
