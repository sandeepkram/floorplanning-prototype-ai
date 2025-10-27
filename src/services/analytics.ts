// src/services/analytics.ts
import { store } from "../data/storefactory.js";
import { TenantId, OccupancyEvent, UtilizationResult } from "../models/types.js";

/**
 * Utility: check if timestamp is within the last N days
 */
function withinDays(dateIso: string, days: number): boolean {
  const ts = new Date(dateIso).getTime();
  const now = Date.now();
  return ts >= now - days * 24 * 60 * 60 * 1000;
}

/**
 * Calculate average people count for a room within a rolling N-day window.
 * Returns average, number of samples, and window length.
 */
export function utilizationLastNDays(
  tenant_id: TenantId,
  room_id: string,
  days: number
): UtilizationResult {
  const events: OccupancyEvent[] = store
    .getRoomEvents(tenant_id, room_id)
    .filter((e: OccupancyEvent) => withinDays(e.timestamp, days));

  const avg =
    events.length > 0
      ? events.reduce(
          (acc: number, e: OccupancyEvent) => acc + (e.people_count ?? 0),
          0
        ) / events.length
      : 0;

  return {
    tenant_id,
    room_id,
    window_days: days,
    average_people: Number(avg.toFixed(2)),
    samples: events.length,
  };
}

/**
 * Recommend underutilized rooms based on 7-day and 30-day utilization ratio.
 * Simple heuristic for demo; can be replaced by ML/forecasting model later.
 */
export function recommendUnderutilizedRooms(
  tenant_id: TenantId,
  office_id: string,
  threshold = 0.3
) {
  const rooms: string[] = store.getOfficeRooms(tenant_id, office_id);
  const results: Array<{
    room_id: string;
    utilization: number;
    avg7d: number;
    max30d: number;
    samples: number;
  }> = [];

  for (const room of rooms) {
    const allEvents: OccupancyEvent[] = store.getRoomEvents(tenant_id, room);
    const last7 = allEvents.filter((e) => withinDays(e.timestamp, 7));
    const last30 = allEvents.filter((e) => withinDays(e.timestamp, 30));

    const avg7 =
      last7.length > 0
        ? last7.reduce(
            (a: number, e: OccupancyEvent) => a + (e.people_count ?? 0),
            0
          ) / last7.length
        : 0;

    const max30 =
      last30.length > 0
        ? Math.max(
            ...last30.map((e: OccupancyEvent) => e.people_count ?? 0)
          )
        : 0;

    const util = max30 > 0 ? avg7 / max30 : 0;

    results.push({
      room_id: room,
      utilization: Number(util.toFixed(2)),
      avg7d: Number(avg7.toFixed(2)),
      max30d: Number(max30.toFixed(2)),
      samples: last7.length,
    });
  }

  return results
    .filter((r) => r.utilization < threshold)
    .sort((a, b) => a.utilization - b.utilization);
}

/**
 * Compute rolling utilization stats for a single room.
 * Used by recommendations and API endpoints.
 */
export function getRoomUtilization(tenant: TenantId, roomId: string) {
  const events: OccupancyEvent[] = store.getRoomEvents(tenant, roomId);

  if (!events.length) {
    return { avg7: 0, max30: 0, totalEvents: 0, message: "No events found" };
    
  }

  const now = Date.now();
  const ms7 = 7 * 24 * 60 * 60 * 1000;
  const ms30 = 30 * 24 * 60 * 60 * 1000;

  const last7 = events.filter(
    (e: OccupancyEvent) => now - new Date(e.timestamp).getTime() <= ms7
  );
  const last30 = events.filter(
    (e: OccupancyEvent) => now - new Date(e.timestamp).getTime() <= ms30
  );

  const avg7 =
    last7.length > 0
      ? last7.reduce(
          (a: number, e: OccupancyEvent) => a + (e.people_count ?? 0),
          0
        ) / last7.length
      : 0;

  const max30 =
    last30.length > 0
      ? Math.max(...last30.map((e: OccupancyEvent) => e.people_count ?? 0))
      : 0;

  return {
    average_people: Number(avg7.toFixed(2)),
    peak_people: Number(max30.toFixed(2)),
    total_events: events.length,
  };
}

// ---------------------------------------------------------------------------
// PRODUCTION UPGRADE STUBS:
// - Replace heuristic with ML model service (forecasting + segmentation).
// - Add confidence intervals and explainability metadata.
// - Parameterize thresholds per-tenant via policy store or feature flags.
// ---------------------------------------------------------------------------
