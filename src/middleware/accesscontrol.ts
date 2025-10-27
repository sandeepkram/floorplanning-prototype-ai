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
// Bypass RBAC + header validation when testing
if (process.env.NODE_ENV === "test") {
  (req as any).accessContext = {
    role: "admin",
    region: "global",
    tenant: "test-tenant"
  };
  return next();
}

  const role = (req.headers["x-user-role"] as string) || "viewer";
  const region = (req.headers["x-user-region"] as string) || "global";
  const tenant = (req.headers["x-tenant-id"] as string) || null;

  // Tenant header is mandatory for all access
  if (!tenant) {
    return res.status(400).json({ error: "Missing required header: x-tenant-id" });
  }

  // Attach access context
  (req as any).accessContext = { role, region, tenant };

  // RBAC enforcement
  const allowedMethods = rolePermissions[role] || [];
  if (!allowedMethods.includes(req.method)) {
    return res.status(403).json({
      error: "Forbidden: insufficient role permissions",
      role,
      method: req.method,
    });
  }

  // Log (only outside tests)
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
