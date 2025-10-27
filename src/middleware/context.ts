// src/middleware/context.ts
import type { Request, Response, NextFunction } from "express";
import type { UserContext } from "../models/types.js";

/**
 * Reads user/tenant context from headers and attaches to req as req.userCtx.
 * Defaults are permissive for local testing.
 *
 * Headers:
 *  - x-tenant-id
 *  - x-user-id
 *  - x-user-role   (Admin | Analyst | Viewer)
 *  - x-user-region (e.g., IN, US)
 */
export function contextMiddleware(req: Request, _res: Response, next: NextFunction) {
  const tenantId = (req.header("x-tenant-id") || "bankcorp").trim();
  const userId = (req.header("x-user-id") || "demo-user").trim();
  const role = (req.header("x-user-role") || "Analyst").trim() as UserContext["role"];
  const region = (req.header("x-user-region") || "IN").trim();

  (req as any).userCtx = { tenantId, userId, role, region } as UserContext;
  next();
}
