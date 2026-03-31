import { z } from 'zod';
export const createBookingSchema = z.object({
  roomId:     z.string().min(1, 'Room is required'),
  checkIn:    z.string().min(1, 'Check-in date is required'),
  checkOut:   z.string().min(1, 'Check-out date is required'),
  guestCount: z.number().min(1).max(10),
  notes:      z.string().optional(),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
