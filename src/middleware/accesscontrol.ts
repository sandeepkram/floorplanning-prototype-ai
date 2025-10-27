import { Request, Response, NextFunction } from "express";

/**
 * 🧩 Role + Region + Tenant Access Control Middleware
 * ---------------------------------------------------
 * - Extracts x-user-role, x-user-region, x-tenant-id from headers
 * - Enforces tenant-level isolation
 * - Applies lightweight RBAC permissions (per route)
 * - Attaches accessContext to req for downstream logic
 *
 * 🔧 Future enhancement:
 * Move rolePermissions to a config file or policy engine
 * (e.g., Casbin, Oso, or custom RBAC registry).
 */

// ------------------------------------------------------------
// RBAC Permission Matrix
// ------------------------------------------------------------
// Define which HTTP methods each role can use.
// ⛔️ NOTE: In production, viewer should be ["GET"] only.
// ✅ Temporarily allowing ["GET", "POST"] for testing Swagger.
// ------------------------------------------------------------
const rolePermissions: Record<string, string[]> = {
  admin:   ["GET", "POST", "PUT", "DELETE"],
  analyst: ["GET", "POST"],
  seller:  ["GET", "POST"],
  viewer:  ["GET", "POST"], // 👈 TEMP: allow POST for viewers during dev/test
};

export function accessControlMiddleware(req: Request, res: Response, next: NextFunction) {
  const path = req.path.toLowerCase();
  const role =
    (req.headers["x-user-role"] as string) ||
    "viewer"; // default to viewer if missing
  const region =
    (req.headers["x-user-region"] as string) ||
    "global"; // default region
  const tenant =
    (req.headers["x-tenant-id"] as string) ||
    (process.env.NODE_ENV === "test" ? "test-tenant" : null);

  // Attach access context for downstream services
  (req as any).accessContext = { role, region, tenant };

  // ----------------------------------------------------------------
  // 1️⃣ Allow NLQ / query endpoints to bypass RBAC temporarily
  // ----------------------------------------------------------------
  if (req.method === "POST" && (path === "/query" || path === "/nlq/query")) {
    return next();
  }

  // ----------------------------------------------------------------
  // 2️⃣ Enforce presence of tenant header in all other cases
  // ----------------------------------------------------------------
  if (!tenant) {
    return res.status(400).json({
      error: "Missing required header: x-tenant-id",
    });
  }

  // ----------------------------------------------------------------
  // 3️⃣ Apply role-based method restriction
  // ----------------------------------------------------------------
  const allowedMethods = rolePermissions[role] || [];

  // If method not allowed for this role → block it
  if (!allowedMethods.includes(req.method)) {
    return res.status(403).json({
      error: "Forbidden: insufficient role permissions",
      role,
      method: req.method,
    });
  }

  // ----------------------------------------------------------------
  // 4️⃣ Optional: Console audit for visibility in non-test env
  // ----------------------------------------------------------------
  if (process.env.NODE_ENV !== "test") {
    console.log(
      `🔐 AccessContext → tenant=${tenant}, role=${role}, region=${region}, method=${req.method}`
    );
  }

  // ----------------------------------------------------------------
  // 5️⃣ Continue to next middleware / route
  // ----------------------------------------------------------------
  next();
}

/**
 * 🧠 Future modularization plan:
 * --------------------------------
 * 1️⃣ Move `rolePermissions` to /config/rbac.config.ts for central policy management
 * 2️⃣ Add role hierarchy (admin > analyst > seller > viewer)
 * 3️⃣ Optionally add declarative JSON/YAML policy:
 *      {
 *        "seller": { "allow": ["/events:GET", "/events:POST"] },
 *        "viewer": { "allow": ["/events:GET"] }
 *      }
 * 4️⃣ Integrate with an external IAM system or JWT claims
 */
