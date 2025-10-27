// src/services/access.ts
import { officeRegions } from "../data/tenantData.js";
import type { UserContext } from "../models/types.js";

/**
 * Simple access policy:
 *  - Admin: full access within tenant (all regions).
 *  - Analyst/Viewer: only offices/rooms in their region (within tenant).
 */
export function canAccessOffice(ctx: UserContext, tenantId: string, officeId: string): boolean {
  if (ctx.tenantId !== tenantId) return false;
  if (ctx.role === "Admin") return true;

  const region = officeRegions[tenantId]?.[officeId];
  if (!region) return false;
  return region === ctx.region;
}

export function canAccessRoom(ctx: UserContext, tenantId: string, officeId: string): boolean {
  // For now, same rule as office-level.
  return canAccessOffice(ctx, tenantId, officeId);
}
