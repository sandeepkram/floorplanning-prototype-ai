export type TenantId = string;

export interface OccupancyEvent {
  tenant_id: string;
  room_id: string;
  timestamp: string; // ISO string
  people_count?: number;
  // PRODUCTION UPGRADE STUB:
  // office_id?: string;   // Optional here for demo. In production, make this required.
  office_id?: string;
  present?: boolean; // new optional field for SQLite mode
  
}

export interface UtilizationResult {
  tenant_id: string;
  room_id: string;
  window_days: number;
  average_people: number;
  samples: number;
}
