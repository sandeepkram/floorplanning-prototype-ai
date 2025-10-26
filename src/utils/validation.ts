import { z } from 'zod';

export const eventSchema = z.object({
  tenant_id: z.string().min(1),
  room_id: z.string().min(1),
  timestamp: z.string().datetime(),
  people_count: z.number().int().nonnegative(),
  office_id: z.string().optional()
});

export type EventInput = z.infer<typeof eventSchema>;
