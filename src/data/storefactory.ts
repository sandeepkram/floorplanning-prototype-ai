// src/data/storefactory.ts
import { SqliteStore } from "./sqliteStore.js";
import { InMemoryStore } from "./v5Store.js"; // will exist after Phase 2
export type StoreMode = "sqlite" | "memory";

// Default: reads STORE_MODE env var, falls back to sqlite
export function createStore(mode?: StoreMode) {
  const resolvedMode: StoreMode = mode ?? ((process.env.STORE_MODE as StoreMode) || "sqlite");
  console.log(`🗃 Using ${resolvedMode.toUpperCase()} data store`);
  if (resolvedMode === "memory") return new InMemoryStore();
  return new SqliteStore();
}

// ✅ Add this line — export the initialized instance
export const store = createStore();
