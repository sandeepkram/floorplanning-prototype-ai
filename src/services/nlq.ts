// src/services/nlq.ts
import { store } from "../data/storefactory.js";
import { getRoomUtilization } from "./analytics.js";
import { canAccessOffice, canAccessRoom } from "./access.js";
import type { UserContext } from "../models/types.js";

/**
 * Lightweight NLQ stub that maps common phrases to existing data/services.
 * Supported intents:
 *  - "utilization of <room> in <tenant>"
 *  - "recommend rooms for <office> in <tenant>"
 *  - "list rooms in <office> for <tenant>"
 */
export async function nlqAnswer(ctx: UserContext, q: string) {
  const query = q.toLowerCase().trim();

  // UTILIZATION
  // e.g., "utilization of conf_a in bankcorp"
  let m = query.match(/utilization of ([a-z0-9_ -]+) in ([a-z0-9_ -]+)/i);
  if (m) {
    const roomId = m[1].trim();
    const tenant = m[2].trim();
    // infer office via latest event for that room
    const events = store.getRoomEvents(tenant, roomId);
    const officeId = events[0]?.office_id;
    if (!officeId) {
      return { intent: "utilization", error: "Room not found or has no events." };
    }
    if (!canAccessRoom(ctx, tenant, officeId)) {
      return { intent: "utilization", error: "Access denied for this room/office/region." };
    }
    const util = getRoomUtilization(tenant, roomId);
    return { intent: "utilization", tenant, room_id: roomId, result: util };
  }

  // RECOMMEND
  // e.g., "recommend rooms for blr_finops in bankcorp"
  m = query.match(/recommend (?:rooms )?for ([a-z0-9_ -]+) in ([a-z0-9_ -]+)/i);
  if (m) {
    const officeId = m[1].trim();
    const tenant = m[2].trim();
    if (!canAccessOffice(ctx, tenant, officeId)) {
      return { intent: "recommend", error: "Access denied for this office/region." };
    }
    const roomIds = store.getOfficeRooms(tenant, officeId);
    const ranked = roomIds
      .map((room) => {
        const util = getRoomUtilization(tenant, room);
        return {
          room_id: room,
          utilization_pct: util.average_people ?? 0,
          total_events: util.total_events ?? 0,
        };
      })
      .sort((a, b) => a.utilization_pct - b.utilization_pct);

    return {
      intent: "recommend",
      tenant,
      office_id: officeId,
      underutilized_rooms: ranked
        .filter((r) => r.utilization_pct < 50 || r.total_events < 5)
        .slice(0, 5),
    };
  }

  // LIST ROOMS
  // e.g., "list rooms in nyc_store for retailx"
  m = query.match(/list rooms in ([a-z0-9_ -]+) for ([a-z0-9_ -]+)/i);
  if (m) {
    const officeId = m[1].trim();
    const tenant = m[2].trim();
    if (!canAccessOffice(ctx, tenant, officeId)) {
      return { intent: "list_rooms", error: "Access denied for this office/region." };
    }
    const rooms = store.getOfficeRooms(tenant, officeId);
    return { intent: "list_rooms", tenant, office_id: officeId, rooms };
  }

  return {
    error:
      "Sorry, I couldn't understand the query. Try:\n- utilization of <room> in <tenant>\n- recommend rooms for <office> in <tenant>\n- list rooms in <office> for <tenant>",
  };
}
