// src/data/storefactory.ts
import { SqliteStore } from "./sqliteStore.js";
import { InMemoryStore } from "./v5Store.js"; // will exist after Phase 2
export type StoreMode = "sqlite" | "memory";

// Default: SQLite
export function createStore(mode: StoreMode = "sqlite") {
  console.log(`🗃 Using ${mode.toUpperCase()} data store`);
  if (mode === "memory") return new InMemoryStore();
  return new SqliteStore();
}

// ✅ Add this line — export the initialized instance
export const store = createStore();
