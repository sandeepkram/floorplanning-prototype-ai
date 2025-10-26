import { OccupancyEvent } from '../models/types.js';

// InMemoryMap for Demo, to be replaced with managed DB (PostgreSQL/Redis/Document Store)
// via ORM (Prisma/TypeORM) and/or caching (Redis Cluster) in production.
// Multi-tenancy is isolated by tenant_id at the top-level Map.
const tenantStore: Map<string, Map<string, OccupancyEvent[]>> = new Map();

// Optional: track office -> rooms mapping per tenant for recommendations.
const officeRooms: Map<string, Map<string, Set<string>>> = new Map();
// tenant -> (office -> set(roomId))

export function addEvent(e: OccupancyEvent): void {
  const tMap = tenantStore.get(e.tenant_id) || new Map();
  const events = tMap.get(e.room_id) || [];
  events.push(e);
  tMap.set(e.room_id, events);
  tenantStore.set(e.tenant_id, tMap);

  // Maintain office->rooms mapping if office_id present
  if (e.office_id) {
    const offMap = officeRooms.get(e.tenant_id) || new Map();
    const set = offMap.get(e.office_id) || new Set();
    set.add(e.room_id);
    offMap.set(e.office_id, set);
    officeRooms.set(e.tenant_id, offMap);
  }
}

export function getTenantRooms(tenant_id: string): Map<string, OccupancyEvent[]> {
  return tenantStore.get(tenant_id) || new Map();
}

export function getRoomEvents(tenant_id: string, room_id: string): OccupancyEvent[] {
  const tMap = tenantStore.get(tenant_id);
  if (!tMap) return [];
  return tMap.get(room_id) || [];
}

export function getOfficeRooms(tenant_id: string, office_id: string): string[] {
  const offMap = officeRooms.get(tenant_id);
  if (!offMap) return [];
  const set = offMap.get(office_id);
  return set ? Array.from(set) : [];
}

// PRODUCTION UPGRADE STUBS:
// - Replace in-memory maps with persistent database and a DAO layer.
// - Add TTL policies, compaction and partitioning for time-series storage.
// - Add per-tenant encryption at rest with KMS-managed keys.
// - Add caching for hot rooms using Redis and cache invalidation on write.
