// src/data/tenantData.ts
import { OccupancyEvent } from "../models/types.js";

/**
 * Static demo tenant and entity definitions.
 * Used to pre-seed demo tenants and events for SQLite/In-Memory stores.
 */
export type User = { id: number; name: string; role: string };
export type Account = { id: number; type: string; balance: number };
export type Product = { id: number; sku: string; name: string; price: number };
export type Patient = { id: number; name: string; condition: string };

export type TenantData = {
  users: User[];
  accounts?: Account[];
  products?: Product[];
  patients?: Patient[];
};

export type Tenants = { [tenantId: string]: TenantData };

export const tenants: Tenants = {
  bankcorp: {
    users: [
      { id: 1, name: "Alice", role: "Relationship Manager" },
      { id: 2, name: "Raj", role: "Credit Analyst" },
      { id: 3, name: "Meera", role: "Compliance Officer" },
    ],
    accounts: [
      { id: 101, type: "Savings", balance: 20000 },
      { id: 102, type: "Loan", balance: -500000 },
      { id: 103, type: "Checking", balance: 1200 },
    ],
  },
  retailx: {
    users: [
      { id: 1, name: "Priya", role: "Store Manager" },
      { id: 2, name: "John", role: "Inventory Analyst" },
      { id: 3, name: "Sana", role: "Cashier" },
    ],
    products: [
      { id: 201, sku: "SKU-001", name: "Notebook", price: 79 },
      { id: 202, sku: "SKU-002", name: "Pen", price: 15 },
      { id: 203, sku: "SKU-003", name: "USB Cable", price: 149 },
    ],
  },
  healthplus: {
    users: [
      { id: 1, name: "Dr. Kumar", role: "Physician" },
      { id: 2, name: "Latha", role: "Nurse" },
      { id: 3, name: "Abdul", role: "Receptionist" },
    ],
    patients: [
      { id: 301, name: "Reena", condition: "Hypertension" },
      { id: 302, name: "Manoj", condition: "Diabetes" },
      { id: 303, name: "Sara", condition: "Asthma" },
    ],
  },
};

export const validTenants = Object.keys(tenants);

/**
 * Pre-seeded occupancy events used for both SQLite and In-Memory stores.
 * Booleans converted to 0/1 friendly fields for SQLite compatibility.
 */
export const seedEvents: OccupancyEvent[] = [
  // Bankcorp demo events
  {
    tenant_id: "bankcorp",
    office_id: "blr_finops",
    room_id: "conf_A",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    present: true,
    people_count: 8,
  },
  {
    tenant_id: "bankcorp",
    office_id: "blr_finops",
    room_id: "conf_B",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    present: false,
    people_count: 0,
  },

  // RetailX demo events
  {
    tenant_id: "retailx",
    office_id: "nyc_store",
    room_id: "stockroom",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    present: true,
    people_count: 3,
  },
  {
    tenant_id: "retailx",
    office_id: "nyc_store",
    room_id: "checkout",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    present: true,
    people_count: 5,
  },

  // HealthPlus demo events
  {
    tenant_id: "healthplus",
    office_id: "chennai_clinic",
    room_id: "opd_room1",
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    present: true,
    people_count: 12,
  },
  {
    tenant_id: "healthplus",
    office_id: "chennai_clinic",
    room_id: "ward_A",
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    present: false,
    people_count: 0,
  },
];

// ---- V5: office → region mapping for role/region access control ----
export const officeRegions: Record<string, Record<string, string>> = {
  bankcorp: {
    blr_finops: "IN",
  },
  retailx: {
    nyc_store: "US",
    nyc_store_ops: "US",
  },
  healthplus: {
    chennai_clinic: "IN",
    hyd_care_hq: "IN",
  },
};
