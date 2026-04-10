import { z } from 'zod';
export const roomSchema = z.object({
  number:    z.string().min(1),
  type:      z.string().min(1),
  floor:     z.number().min(1),
  basePrice: z.number().min(0),
  capacity:  z.number().min(1),
  description: z.string().optional(),
});

export const CreateRoomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  floor: z.coerce.number().int().min(0, "Floor must be 0 or higher"),
  type: z.enum(["STANDARD", "DELUXE", "SUITE", "VILLA", "PENTHOUSE"], {
    errorMap: () => ({ message: "Please select a room type" }),
  }),
  bedType: z.enum(["SINGLE", "DOUBLE", "QUEEN", "KING", "TWIN"], {
    errorMap: () => ({ message: "Please select a bed type" }),
  }),
  maxOccupancy: z.coerce.number().min(1, "Must accommodate at least 1 person"),
  sizeInSqFt: z.coerce.number().optional(),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  view: z.string().optional(),
  smokingAllowed: z.boolean().default(false),
  petFriendly: z.boolean().default(false),
  notes: z.string().optional(),
  amenityIds: z.array(z.string()).default([]),
});

export type CreateRoomFormValues = z.infer<typeof CreateRoomSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
