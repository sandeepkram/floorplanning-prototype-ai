// src/data/sqliteStore.ts
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { OccupancyEvent, TenantId } from "../models/types.js";
import { seedEvents } from "../data/tenantData.js";

export class SqliteStore {
  private db: Database.Database;

  constructor(filePath = "./data/saltmine.db") {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    this.db = new Database(filePath);
    this.initSchema();
  }

  private initSchema() {
    this.db
      .prepare(`
        CREATE TABLE IF NOT EXISTS events (
          tenant_id TEXT,
          office_id TEXT,
          room_id TEXT,
          timestamp TEXT,
          present INTEGER,
          people_count INTEGER DEFAULT 0
        )
      `)
      .run();
  }

  saveEvent(ev: OccupancyEvent) {
    this.db
      .prepare(
        `
        INSERT INTO events (tenant_id, office_id, room_id, timestamp, present, people_count)
        VALUES (@tenant_id, @office_id, @room_id, @timestamp, @present, @people_count)
      `
      )
      .run({
        tenant_id: ev.tenant_id,
        office_id: ev.office_id,
        room_id: ev.room_id,
        timestamp: ev.timestamp,
        present: ev.present ? 1 : 0,      // ✅ fix boolean
        people_count: ev.people_count ?? 0 // ✅ null-safe
      });
  }

  getRoomEvents(tenant: TenantId, roomId: string, sinceISO?: string): OccupancyEvent[] {
    if (sinceISO) {
      return this.db
        .prepare(
          `SELECT tenant_id, office_id, room_id, timestamp, present, people_count
           FROM events
           WHERE tenant_id=? AND room_id=? AND timestamp>=?
           ORDER BY timestamp`
        )
        .all(tenant, roomId, sinceISO) as OccupancyEvent[];
    }
    return this.db
      .prepare(
        `SELECT tenant_id, office_id, room_id, timestamp, present, people_count
         FROM events
         WHERE tenant_id=? AND room_id=?
         ORDER BY timestamp`
      )
      .all(tenant, roomId) as OccupancyEvent[];
  }

  getOfficeRooms(tenant: TenantId, officeId: string): string[] {
    const rows = this.db
      .prepare(`SELECT DISTINCT room_id FROM events WHERE tenant_id=? AND office_id=?`)
      .all(tenant, officeId);
    return rows.map((r: any) => r.room_id);
  }

  seed() {
    const countRow = this.db.prepare(`SELECT COUNT(*) AS c FROM events`).get() as { c: number };
    const count = countRow?.c ?? 0;

    if (count === 0) {
      console.log(`🌱  Seeding ${seedEvents.length} events into SQLite store...`);

      const insert = this.db.prepare(`
        INSERT INTO events (tenant_id, office_id, room_id, timestamp, present, people_count)
        VALUES (@tenant_id, @office_id, @room_id, @timestamp, @present, @people_count)
      `);

      const tx = this.db.transaction((rows: OccupancyEvent[]) => {
        for (const ev of rows) {
          insert.run({
            tenant_id: ev.tenant_id,
            office_id: ev.office_id,
            room_id: ev.room_id,
            timestamp: ev.timestamp,
            present: ev.present ? 1 : 0,      // ✅ convert boolean
            people_count: ev.people_count ?? 0 // ✅ handle null
          });
        }
      });

      tx(seedEvents);
      console.log("✅ SQLite seed complete.");
    } else {
      console.log(`⚙️  SQLite already contains ${count} events — skipping seed.`);
    }
  }

  async clear() {
  console.log('🧹 Clearing SQLite data store...');
  await this.db.exec('DELETE FROM events');
}

}
