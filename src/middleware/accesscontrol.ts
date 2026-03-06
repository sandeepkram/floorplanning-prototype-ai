import { Request, Response, NextFunction } from "express";

/**
 * 🧩 Role + Region + Tenant Access Control Middleware
 * ---------------------------------------------------
 * - Extracts x-user-role, x-user-region, x-tenant-id from headers
 * - Enforces tenant-level isolation
 * - Applies lightweight RBAC permissions (per route)
 * - Attaches accessContext to req for downstream logic
 *
 * ✅ Environment-smart RBAC
 * - Local/Render: viewer allowed POST for demo convenience
 * - Test/Production: viewer read-only (GET only)
 */

// ------------------------------------------------------------
// 🌐 Environment-Sensitive Permission Matrix
// ------------------------------------------------------------

// Evaluated per-request so NODE_ENV changes at runtime/test take effect
function getRolePermissions(): Record<string, string[]> {
  const env = process.env.NODE_ENV;
  const viewerPermissions =
    env === "test" || env === "production"
      ? ["GET"]           // Strict: for CI & production demos
      : ["GET", "POST"];  // Relaxed: for local dev & Swagger demo

  return {
    admin:   ["GET", "POST", "PUT", "DELETE"],
    analyst: ["GET", "POST"],
    seller:  ["GET", "POST"],
    viewer:  viewerPermissions,
  };
}

// ------------------------------------------------------------
// 🧩 Middleware Implementation
// ------------------------------------------------------------
export function accessControlMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const path = req.path.toLowerCase();
  const role = (req.headers["x-user-role"] as string) || "viewer";
  const region = (req.headers["x-user-region"] as string) || "global";
  const tenant =
    (req.headers["x-tenant-id"] as string) ||
    (process.env.NODE_ENV === "test" ? "test-tenant" : null);

  // Attach access context for downstream services
  (req as any).accessContext = { role, region, tenant };

  // 1️⃣ Allow NLQ / Query endpoints to bypass RBAC for now
  if (req.method === "POST" && (path === "/query" || path === "/nlq/query")) {
    return next();
  }

  // 2️⃣ Enforce presence of tenant header in all other cases
  if (!tenant) {
    return res.status(400).json({
      error: "Missing required header: x-tenant-id",
    });
  }

  // 3️⃣ Apply role-based method restriction
  const allowedMethods = getRolePermissions()[role] || [];
  if (!allowedMethods.includes(req.method)) {
    return res.status(403).json({
      error: "Forbidden: insufficient role permissions",
      role,
      method: req.method,
    });
  }

  // 4️⃣ Optional: Log access context for visibility
  if (process.env.NODE_ENV !== "test") {
    console.log(
      `🔐 AccessContext → tenant=${tenant}, role=${role}, region=${region}, method=${req.method}`
    );
  }

  // 5️⃣ Continue to next middleware / route
  next();
}

/**
 * 🧠 Future modularization plan:
 * --------------------------------
 * 1️⃣ Move `rolePermissions` to /config/rbac.config.ts for central policy management
 * 2️⃣ Add role hierarchy (admin > analyst > seller > viewer)
 * 3️⃣ Optionally use declarative JSON/YAML policy
 * 4️⃣ Integrate with IAM/JWT claims later
 */
