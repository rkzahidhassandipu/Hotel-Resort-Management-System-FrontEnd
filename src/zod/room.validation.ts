import { z } from 'zod';
export const roomSchema = z.object({
  number:    z.string().min(1),
  type:      z.string().min(1),
  floor:     z.number().min(1),
  basePrice: z.number().min(0),
  capacity:  z.number().min(1),
  description: z.string().optional(),
});
export type RoomInput = z.infer<typeof roomSchema>;
