import Database from 'better-sqlite3';
import { OccupancyEvent, TenantId } from '../models/types';
import { seedEvents } from "./tenantData";

export class SqliteStore {
  private db: Database.Database;

  constructor(filePath = './data/saltmine.db') {
    this.db = new Database(filePath);
    this.initSchema();
  }

  private initSchema() {
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS events (
        tenant_id TEXT,
        office_id TEXT,
        room_id TEXT,
        timestamp TEXT,
        present INTEGER
        people_count INTEGER
      )
    `).run();
  }

  saveEvent(ev: OccupancyEvent) {
    this.db.prepare(`
      INSERT INTO events (tenant_id, office_id, room_id, timestamp, present)
      VALUES (?, ?, ?, ?, ?)
    `).run(ev.tenant_id, ev.office_id, ev.room_id, ev.timestamp, ev.present ? 1 : 0);
  }

  getRoomEvents(tenant: TenantId, roomId: string, sinceISO?: string): OccupancyEvent[] {
    if (sinceISO) {
      return this.db.prepare(`
        SELECT tenant_id, office_id, room_id, timestamp, present
        FROM events
        WHERE tenant_id=? AND room_id=? AND timestamp>=?
        ORDER BY timestamp
      `).all(tenant, roomId, sinceISO) as OccupancyEvent[];;
    }
    return this.db.prepare(`
      SELECT tenant_id, office_id, room_id, timestamp, present
      FROM events
      WHERE tenant_id=? AND room_id=?
      ORDER BY timestamp
    `).all(tenant, roomId) as OccupancyEvent[];;
  }

  getOfficeRooms(tenant: TenantId, officeId: string): string[] {
    const rows = this.db.prepare(`
      SELECT DISTINCT room_id FROM events WHERE tenant_id=? AND office_id=?
    `).all(tenant, officeId);
    return rows.map((r: any) => r.room_id);
  }

  seed() {
  // TypeScript-safe wrapper for better-sqlite3 .get()
  const row = this.db.prepare("SELECT COUNT(*) AS c FROM events").get() as { c: number };
  const count = row.c;

  if (count === 0) {
    console.log("🌱  Seeding initial events into SQLite store...");

    const insert = this.db.prepare(`
      INSERT INTO events (tenant_id, office_id, room_id, timestamp, present)
      VALUES (@tenant_id, @office_id, @room_id, @timestamp, @present)
    `);

    const tx = this.db.transaction((rows: typeof seedEvents) => {
      for (const ev of rows) insert.run(ev);
    });

    tx(seedEvents);
    } else {
        console.log(`✅  SQLite already has ${count} events — skipping seed.`);
        }
    }
}
