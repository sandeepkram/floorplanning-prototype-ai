import { OccupancyEvent, UtilizationResult } from '../models/types.js';
import { getRoomEvents, getOfficeRooms } from './dataStore.js';

function withinDays(dateIso: string, days: number): boolean {
  const ts = new Date(dateIso).getTime();
  const now = Date.now();
  return ts >= now - days * 24 * 60 * 60 * 1000;
}

export function utilizationLastNDays(tenant_id: string, room_id: string, days: number): UtilizationResult {
  const events = getRoomEvents(tenant_id, room_id).filter(e => withinDays(e.timestamp, days));
  const avg = events.length ? events.reduce((acc, e) => acc + (e.people_count ?? 0), 0) / events.length : 0;
  return {
    tenant_id,
    room_id,
    window_days: days,
    average_people: Number(avg.toFixed(2)),
    samples: events.length
  };
}

export function recommendUnderutilizedRooms(tenant_id: string, office_id: string, threshold = 0.3) {
  // Heuristic:
  // - For each room in office, compute avg people_count (7d) and max observed people_count (30d).
  // - Approximate utilization% = avg7d / max30d (fallback to 1 if max is 0).
  // - Recommend rooms with utilization% < threshold.
  const rooms = getOfficeRooms(tenant_id, office_id);
  const results: Array<{ room_id: string; utilization: number; avg7d: number; max30d: number; samples: number }> = [];

  for (const room of rooms) {
    const allEvents = getRoomEvents(tenant_id, room);
    const last7 = allEvents.filter(e => withinDays(e.timestamp, 7));
    const last30 = allEvents.filter(e => withinDays(e.timestamp, 30));
    const avg7 = last7.length ? last7.reduce((a, e) => a + (e.people_count ?? 0), 0) / last7.length : 0;
    const max30 = last30.length ? Math.max(...last30.map(e => e.people_count ?? 0)) : 0;
    const util = max30 > 0 ? avg7 / max30 : 0;
    results.push({ room_id: room, utilization: Number(util.toFixed(2)), avg7d: Number(avg7.toFixed(2)), max30d: max30, samples: last7.length });
  }

  return results
    .filter(r => r.utilization < threshold)
    .sort((a, b) => a.utilization - b.utilization);
}

// PRODUCTION UPGRADE STUBS:
// - Replace heuristic with ML model service (forecasting + segmentation).
// - Add confidence intervals and explainability metadata.
// - Parameterize thresholds per-tenant via policy store or feature flags.
