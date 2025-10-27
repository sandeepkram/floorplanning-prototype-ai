// src/data/v5Store.ts
import { OccupancyEvent, TenantId } from "../models/types.js";
import { seedEvents } from "../data/tenantData.js";

/**
 * Simple in-memory store for OccupancyEvents.
 * Mirrors the SQLiteStore API for hybrid compatibility.
 */
type RoomKey = string;   // `${tenant}:${room}`
type OfficeKey = string; // `${tenant}:${office}`

export class InMemoryStore {
  private eventsByRoom = new Map<RoomKey, OccupancyEvent[]>();
  private roomsByOffice = new Map<OfficeKey, Set<string>>();
  private events: any[] = [];   // ✅ define events array for in-memory data

  constructor() {
    // Pre-seed lightweight demo data (same as SQLite seed)
    this.seed();
  }

  /** Store a new occupancy event */
  saveEvent(ev: OccupancyEvent) {
    const rkey: RoomKey = `${ev.tenant_id}:${ev.room_id}`;
    const arr = this.eventsByRoom.get(rkey) ?? [];
    arr.push(ev);
    this.eventsByRoom.set(rkey, arr);

    const okey: OfficeKey = `${ev.tenant_id}:${ev.office_id}`;
    const set = this.roomsByOffice.get(okey) ?? new Set<string>();
    set.add(ev.room_id);
    this.roomsByOffice.set(okey, set);
  }

  /** Retrieve events for a specific tenant + room */
  getRoomEvents(tenant: TenantId, roomId: string, sinceISO?: string): OccupancyEvent[] {
    const rkey: RoomKey = `${tenant}:${roomId}`;
    const arr = this.eventsByRoom.get(rkey) ?? [];
    if (!sinceISO) return arr;
    const since = Date.parse(sinceISO);
    return arr.filter(e => Date.parse(e.timestamp) >= since);
  }

  /** List all rooms for a given tenant + office */
  getOfficeRooms(tenant: TenantId, officeId: string): string[] {
    const okey: OfficeKey = `${tenant}:${officeId}`;
    return Array.from(this.roomsByOffice.get(okey) ?? []);
  }

  /** Initialize with seed data (for demo use only) */
  seed() {
    if (!seedEvents?.length) return;

    console.log(`🌱  Pre-seeding ${seedEvents.length} demo events into InMemoryStore...`);
    for (const ev of seedEvents) {
      this.saveEvent(ev);
    }
  }

  clear() {
  console.log('🧹 Clearing InMemory store...');
  this.events = [];
}

}
