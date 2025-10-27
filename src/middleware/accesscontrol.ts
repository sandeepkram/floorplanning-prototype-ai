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

// Define simple RBAC permission map
const rolePermissions: Record<string, string[]> = {
  admin: ["GET", "POST", "PUT", "DELETE"],
  analyst: ["GET", "POST"],
  seller: ["GET", "POST"],
  viewer: ["GET"],
};

export function accessControlMiddleware(req: Request, res: Response, next: NextFunction) {
  const path = req.path.toLowerCase();
  const role = (req.headers["x-user-role"] as string) || "viewer";
  const region = (req.headers["x-user-region"] as string) || "global";
  const tenant = (req.headers["x-tenant-id"] as string) || (process.env.NODE_ENV === "test" ? "test-tenant" : null);

  // Attach access context
  (req as any).accessContext = { role, region, tenant };

  // Allow NLQ endpoint bypass for now
  if (req.method === "POST" && (path === "/query" || path === "/nlq/query")) {
    return next();
  }

  // Tenant header is mandatory in all other cases
  if (!tenant) {
    return res.status(400).json({ error: "Missing required header: x-tenant-id" });
  }

  // RBAC enforcement
  const allowedMethods = rolePermissions[role] || [];
  if (!allowedMethods.includes(req.method)) {
    return res.status(403).json({
      error: "Forbidden: insufficient role permissions",
      role,
      method: req.method,
    });
  }

  if (process.env.NODE_ENV !== "test") {
    console.log(`🔐 AccessContext → tenant=${tenant}, role=${role}, region=${region}, method=${req.method}`);
  }

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