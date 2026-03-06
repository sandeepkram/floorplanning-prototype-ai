// src/services/recommend.ts
import { store } from "../data/storefactory.js";
import { TenantId, OccupancyEvent } from "../models/types.js";
import { getRoomUtilization } from "../services/analytics.js";

/**
 * Generates room recommendations (underutilized spaces) for a given tenant and office.
 * 
 * @param tenant - Tenant identifier (string)
 * @param officeId - Office identifier (string)
 * @returns Summary object with underutilized rooms and utilization statistics.
 */
export function getRecommendations(tenant: TenantId, officeId: string) {
  const roomIds: string[] = store.getOfficeRooms(tenant, officeId);

  if (!roomIds.length) {
    return { message: "No rooms found for this office." };
  }

  // Collect utilization data for each room
  const recommendations = roomIds.map((room_id: string) => {
    const util = getRoomUtilization(tenant, room_id);
    return {
      room_id,
      utilization_pct: util.average_people ?? 0,
      total_events: util.total_events ?? 0,
    };
  });

  // Rank rooms (lowest utilization first)
  const sorted = recommendations.sort(
    (a: { utilization_pct: number }, b: { utilization_pct: number }) =>
      a.utilization_pct - b.utilization_pct
  );

  // Select rooms with <50% utilization or very few events
  const underutilized = sorted.filter(
    (r: { utilization_pct: number; total_events: number }) =>
      r.utilization_pct < 50 || r.total_events < 5
  );

  return {
    office_id: officeId,
    total_rooms: roomIds.length,
    underutilized_rooms: underutilized.slice(0, 5),
  };
}
