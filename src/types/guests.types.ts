// ── types.ts ─────────────────────────────────────────────
export interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  purpose?: string;
  notes?: string;
  visitedAt: string;
  convertedToCustomer: boolean;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomType?: string;
  budget?: number;
  message?: string;
  isResolved: boolean;
  createdAt: string;
}

export interface HotelInfo {
  id: string;
  key: string;
  value: string;
  description?: string;
  isPublic: boolean;
}