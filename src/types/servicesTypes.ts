export type SRStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type SRPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type SRType =
  | "LAUNDRY" | "ROOM_SERVICE" | "EXTRA_TOWELS" | "EXTRA_PILLOW"
  | "WAKE_UP_CALL" | "TAXI_BOOKING" | "TOUR_BOOKING" | "SPA_BOOKING"
  | "SPECIAL_ARRANGEMENT" | "OTHER";

export interface ServiceRequest {
  id: string;
  type: SRType;
  status: SRStatus;
  priority: SRPriority;
  description?: string;
  notes?: string;
  cost?: number;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
  customerId: string;
  bookingId?: string;
  assignedToId?: string;
  customer?: { firstName: string; lastName: string; phone: string };
  booking?: { bookingNumber: string; room?: { roomNumber: string } };
  [key: string]: unknown;
}

export const SR_TYPES: SRType[] = [
  "LAUNDRY", "ROOM_SERVICE", "EXTRA_TOWELS", "EXTRA_PILLOW",
  "WAKE_UP_CALL", "TAXI_BOOKING", "TOUR_BOOKING", "SPA_BOOKING",
  "SPECIAL_ARRANGEMENT", "OTHER",
];

export const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const inputCls = "w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3 py-2 rounded-lg outline-none focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20";
export const selectCls = `${inputCls} cursor-pointer`;