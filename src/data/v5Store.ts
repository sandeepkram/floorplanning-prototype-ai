// src/data/v5Store.ts
import { OccupancyEvent, TenantId } from '../models/types';

type RoomKey = string;   // `${tenant}:${room}`
type OfficeKey = string; // `${tenant}:${office}`

export class InMemoryStore {
  private eventsByRoom = new Map<RoomKey, OccupancyEvent[]>();
  private roomsByOffice = new Map<OfficeKey, Set<string>>();

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

  getRoomEvents(tenant: TenantId, roomId: string, sinceISO?: string): OccupancyEvent[] {
    const rkey: RoomKey = `${tenant}:${roomId}`;
    const arr = this.eventsByRoom.get(rkey) ?? [];
    if (!sinceISO) return arr;
    const since = Date.parse(sinceISO);
    return arr.filter(e => Date.parse(e.timestamp) >= since);
  }

  getOfficeRooms(tenant: TenantId, officeId: string): string[] {
    const okey: OfficeKey = `${tenant}:${officeId}`;
    return Array.from(this.roomsByOffice.get(okey) ?? []);
  }
}
