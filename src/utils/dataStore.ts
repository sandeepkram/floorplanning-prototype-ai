import { tenants, validTenants, TenantData } from "../data/tenantData";

export function getTenantId(pathTenant?: string, headerTenant?: string): string {
  const candidate = pathTenant || headerTenant;
  if (!candidate) throw new Error("Missing tenant ID. Provide path /api/{tenantId} or header x-tenant-id");
  if (!validTenants.includes(candidate)) throw new Error(`Invalid tenant ID '${candidate}'. Allowed: ${validTenants.join(", ")}`);
  return candidate;
}

export function getEntitySlice(tenantId: string, entity: string): any[] {
  const data = tenants[tenantId] as TenantData;
  if (!data) throw new Error(`Unknown tenant: ${tenantId}`);
  const allowed = ["users", "accounts", "products", "patients"];
  if (!allowed.includes(entity)) {
    throw new Error(`Unsupported entity '${entity}'. Allowed: ${allowed.join(", ")}`);
  }
  const slice = (data as any)[entity];
  if (!Array.isArray(slice)) return [];
  return slice;
}

export function insertEntityRecord(tenantId: string, entity: string, record: any): any {
  const arr = getEntitySlice(tenantId, entity);
  if (record && typeof record === "object" && !Array.isArray(record)) {
    if (typeof record.id !== "number") {
      const nextId = (arr.reduce((max: number, r: any) => Math.max(max, typeof r.id === "number" ? r.id : 0), 0) || 0) + 1;
      (record as any).id = nextId;
    }
    arr.push(record);
    return record;
  }
  throw new Error("Invalid record payload");
}
