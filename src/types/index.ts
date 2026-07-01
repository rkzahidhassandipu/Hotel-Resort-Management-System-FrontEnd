export type Role = 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER' | 'MAINTENANCE' | 'CHEF';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW' | 'WAITLISTED';
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE' | 'OUT_OF_ORDER' | 'RESERVED';
export type RoomType = 'SINGLE' | 'DOUBLE' | 'TWIN' | 'SUITE' | 'DELUXE' | 'PENTHOUSE' | 'FAMILY' | 'VILLA';
export type BedType = 'SINGLE' | 'DOUBLE' | 'QUEEN' | 'KING' | 'TWIN' | 'BUNK';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'ONLINE_PAYMENT' | 'MOBILE_BANKING' | 'CRYPTO';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
export type OrderType = 'DINE_IN' | 'ROOM_SERVICE' | 'TAKEAWAY';
export type FoodCategory = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS' | 'BEVERAGES' | 'DESSERTS' | 'SPECIAL';
export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type MaintenanceType = 'ELECTRICAL' | 'PLUMBING' | 'HVAC' | 'FURNITURE' | 'CLEANING' | 'OTHER';
export type StaffTaskStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ServiceRequestStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ServiceRequestType = 'LAUNDRY' | 'ROOM_SERVICE' | 'EXTRA_TOWELS' | 'EXTRA_PILLOW' | 'WAKE_UP_CALL' | 'TAXI_BOOKING' | 'TOUR_BOOKING' | 'SPA_BOOKING' | 'SPECIAL_ARRANGEMENT' | 'OTHER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
export type MembershipTier = 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
export type ShiftType = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'FLEXIBLE';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
export type NotificationType = 'BOOKING_CONFIRMATION' | 'BOOKING_CANCELLATION' | 'CHECK_IN_REMINDER' | 'CHECK_OUT_REMINDER' | 'PAYMENT_RECEIVED' | 'PAYMENT_DUE' | 'MAINTENANCE_UPDATE' | 'SERVICE_UPDATE' | 'GENERAL_ALERT' | 'SYSTEM_ALERT';
export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
export type StockStatus = 'SUFFICIENT' | 'LOW' | 'OUT_OF_STOCK' | 'OVERSTOCKED';
export type ProcurementStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'VOID' | 'CANCELLED';

export interface User {
  id: string; email: string; phone?: string; role: Role; status: UserStatus;
  firstName: string; lastName: string; gender?: string; dateOfBirth?: string;
  avatarUrl?: string; nationalId?: string; passportNumber?: string;
  nationality?: string; address?: string; city?: string; country?: string;
  zipCode?: string; emailVerifiedAt?: string; lastLoginAt?: string;
  twoFactorEnabled: boolean; createdAt: string; updatedAt: string;
  customerProfile?: CustomerProfile; staffProfile?: StaffProfile;
    [key: string]: any;
}
export interface CustomerProfile {
  id: string; userId: string; loyaltyPoints: number; membershipTier: MembershipTier;
  totalSpent: number; totalStays: number; preferences?: Record<string, unknown>; notes?: string;
  [key: string]: any;
}
export interface StaffProfile {
  id: string; userId: string; employeeId: string; department: string;
  designation: string; joiningDate: string; salary: number; shift: ShiftType;
  isOnDuty: boolean; user?: User;
  [key: string]: any;
}
export interface RoomCategory {
  id: string; name: string; description?: string; basePrice: number;
  weekendPrice?: number; maxOccupancy: number; amenities: string[];
  createdAt: string; updatedAt: string;
  [key: string]: any;
}
export interface Room {
  id: string; roomNumber: string; floor: number; type: RoomType; status: RoomStatus;
  bedType: BedType; maxOccupancy: number; sizeInSqFt?: number; categoryId: string;
  description?: string; view?: string; smokingAllowed: boolean; petFriendly: boolean;
  isActive: boolean; notes?: string; createdAt: string; updatedAt: string;
  category?: RoomCategory; images?: RoomImage[]; amenities?: { amenity: Amenity }[];
  [key: string]: any;
}
export interface RoomImage {
  id: string; roomId: string; imageUrl: string; caption?: string; isPrimary: boolean; sortOrder: number;
}
export interface Amenity { id: string; name: string; icon?: string; category?: string; }
export interface Booking {
  id: string; bookingNumber: string; customerId: string; roomId: string; createdById?: string;
  status: BookingStatus; checkInDate: string; checkOutDate: string; actualCheckIn?: string;
  actualCheckOut?: string; nights: number; adults: number; children: number;
  pricePerNight: number; subtotal: number; taxAmount: number; discountAmount: number;
  totalAmount: number; specialRequests?: string; arrivalTime?: string; source?: string;
  promoCode?: string; cancellationReason?: string; cancelledAt?: string;
  createdAt: string; updatedAt: string; customer?: User; room?: Room; payments?: Payment[];[key: string]: unknown; 

}
export interface Payment {
  id: string; paymentNumber: string; bookingId?: string; userId: string; amount: number;
  method: PaymentMethod; status: PaymentStatus; currency: string; transactionId?: string;
  notes?: string; paidAt?: string; refundedAt?: string; refundAmount?: number;
  refundReason?: string; createdAt: string; updatedAt: string; booking?: Booking; user?: User;
  [key: string]: any;
}
export interface MenuCategory {
  id: string; name: string; description?: string; imageUrl?: string;
  isActive: boolean; sortOrder: number; menuItems?: MenuItem[];
  [key: string]: any;
}
export interface MenuItem {
  id: string; categoryId: string; name: string; description?: string; imageUrl?: string;
  price: number; discountedPrice?: number; foodCategory: FoodCategory; preparationTime?: number;
  calories?: number; isVegetarian: boolean; isVegan: boolean; isGlutenFree: boolean;
  isAvailable: boolean; ingredients: string[]; allergens: string[];
  sortOrder: number; createdAt: string; updatedAt: string; category?: MenuCategory;
  [key: string]: any;
}
export interface FoodOrderItem {
  id: string; orderId: string; menuItemId: string; quantity: number;
  unitPrice: number; totalPrice: number; notes?: string; menuItem?: MenuItem;
  [key: string]: any;
}
export interface FoodOrder {
  id: string; orderNumber: string; bookingId?: string; customerId: string;
  type: OrderType; status: OrderStatus; tableNumber?: string; roomNumber?: string;
  subtotal: number; taxAmount: number; totalAmount: number; specialNotes?: string;
  estimatedTime?: number; confirmedAt?: string; preparingAt?: string;
  readyAt?: string; deliveredAt?: string; cancelledAt?: string;
  createdAt: string; updatedAt: string; items?: FoodOrderItem[]; customer?: User; booking?: Booking;
  [key: string]: any;
}

export interface StaffTask {
  id: string; title: string; description?: string; assignedToId: string; createdById: string;
  status: StaffTaskStatus; priority: TaskPriority; dueDate?: string;
  startedAt?: string; completedAt?: string; notes?: string;
  createdAt: string; updatedAt: string; assignedTo?: User; createdBy?: User;
  [key: string]: any;
}
export interface ServiceRequest {
  id: string; requestNumber: string; bookingId?: string; customerId: string; assignedToId?: string;
  type: ServiceRequestType; status: ServiceRequestStatus; description?: string;
  scheduledAt?: string; completedAt?: string; priority: TaskPriority; notes?: string;
  cost?: number; createdAt: string; updatedAt: string; customer?: User; booking?: Booking; assignedTo?: User;
  [key: string]: any;
}
export interface InventoryCategory { id: string; name: string; description?: string; }
export interface InventoryItem {
  id: string; categoryId: string; name: string; sku: string; unit: string;
  currentStock: number; minimumStock: number; maximumStock?: number; reorderPoint: number;
  unitCost: number; supplier?: string; location?: string; expiryDate?: string;
  status: StockStatus; notes?: string; createdAt: string; updatedAt: string; category?: InventoryCategory;
  [key: string]: any;
}
export interface ProcurementOrder {
  id: string; orderNumber: string; requestedById: string; approvedById?: string;
  status: ProcurementStatus; supplier?: string; totalAmount?: number;
  expectedDate?: string; receivedDate?: string; notes?: string;
  createdAt: string; updatedAt: string; requestedBy?: User;
}
export interface Review {
  id: string; bookingId?: string; userId: string; overallRating: number;
  cleanlinessRating?: number; serviceRating?: number; foodRating?: number;
  locationRating?: number; valueRating?: number; title?: string; comment?: string;
  status: ReviewStatus; isAnonymous: boolean; managerResponse?: string;
  respondedAt?: string; createdAt: string; updatedAt: string; user?: User; booking?: Booking;
  [key: string]: any;
}
export interface Notification {
  id: string; userId: string; type: NotificationType; channel: NotificationChannel;
  title: string; message: string; data?: Record<string, unknown>;
  isRead: boolean; readAt?: string; sentAt?: string; isSent: boolean; createdAt: string;
  [key: string]: any;
}
export interface Shift {
  id: string; staffProfileId: string; type: ShiftType; date: string;
  startTime: string; endTime: string; actualStartTime?: string; actualEndTime?: string;
  isPresent?: boolean; overtimeHours?: number; notes?: string; staffProfile?: StaffProfile;
  [key: string]: any;
}
export interface PerformanceReview {
  id: string; staffProfileId: string; reviewedById?: string; period: string;
  rating: number; punctuality?: number; productivity?: number; attitude?: number;
  teamwork?: number; comments?: string; goals?: string; reviewedAt: string;
  [key: string]: any;
}
export interface SystemLog {
  id: string; userId?: string; action: string; level: string; resource: string;
  resourceId?: string; description: string; ipAddress?: string; userAgent?: string;
  createdAt: string; user?: User;
  [key: string]: any;
}
export interface DashboardStats {
  totalRooms: number; availableRooms: number; occupiedRooms: number; occupancyRate: number;
  totalBookings: number; pendingBookings: number; todayCheckIns: number; todayCheckOuts: number;
  todayRevenue: number; monthlyRevenue: number; totalGuests: number; openMaintenance: number;
  todayFoodOrders: number; averageRating: number;
  [key: string]: any;
}
export interface ApiResponse<T> { data: T; message: string; success: boolean; }
export interface PaginatedResponse<T> { data: T[]; total: number; page: number; limit: number; totalPages: number; }



export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  menuItems?: MenuItem[];
  _count?: {
    items: number;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  category?: MenuCategory;
  isAvailable: boolean;
  imageUrl?: string;
  foodCategory: FoodCategory;
  preparationTime?: number;
}

export type MenuItemPayload = Omit<MenuItem, "id" | "category">;

export type ByStatusEntry = {
  status: string;
  _count: {
    status: number;
  };
};

export type Tab = "orders" | "items" | "categories";

export interface FoodStats {
  total: number;
  pending: number;
  preparing: number;
  delivered: number;
  todayRevenue: number;
}


export interface MaintenancePart {
  id: string;
  partName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}


export interface MaintenanceLog {
  id: string;
  ticketNumber: string;
  roomId?: string | null;
  location?: string | null;
  type: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  title: string;
  description: string;
  notes?: string | null;
  actualHours?: number | null;
  cost?: number | null;
  scheduledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  room?: { roomNumber: string; floor?: number; type?: string } | null;
  reportedBy?: { firstName: string; lastName: string; role?: string };
  assignedTo?: { firstName: string; lastName: string; role?: string } | null;
  parts?: MaintenancePart[];
}

export interface HousekeepingLog {
  id: string;
  roomId: string;
  staffId?: string | null;
  status: string;
  type: string;
  notes?: string | null;
  checklist?: Record<string, boolean> | null;
  date: string;
  startedAt?: string | null;
  completedAt?: string | null;
  room?: { roomNumber: string; floor?: number };
  staff?: { firstName: string; lastName: string } | null;
}

export interface MaintenanceStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
  overduePending: number;
}

export interface StaffOption {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}




export interface ServiceRequest {
  id: string;
  requestNumber: string;
  bookingId?: string;
  customerId: string;
  assignedToId?: string;
  type: SRType;
  status: SRStatus;
  priority: SRPriority;
  description?: string;
  scheduledAt?: string;
  completedAt?: string;
  notes?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
  customer?: User;
  booking?: Booking;
  assignedTo?: User;
}

export type SRStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type SRPriority = TaskPriority;
export type SRType =
  | 'LAUNDRY' | 'ROOM_SERVICE' | 'EXTRA_TOWELS' | 'EXTRA_PILLOW'
  | 'WAKE_UP_CALL' | 'TAXI_BOOKING' | 'TOUR_BOOKING' | 'SPA_BOOKING'
  | 'SPECIAL_ARRANGEMENT' | 'OTHER';

export interface SRStats {
  pendingCount: number;
  byStatus: { status: SRStatus; _count: { status: number } }[];
}

export interface SRListResponse {
  requests: ServiceRequest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SRFilters {
  status: string;
  type: string;
  priority: string;
  page: string;
  limit: string;
}

export const SR_TYPES: SRType[] = [
  'LAUNDRY', 'ROOM_SERVICE', 'EXTRA_TOWELS', 'EXTRA_PILLOW',
  'WAKE_UP_CALL', 'TAXI_BOOKING', 'TOUR_BOOKING', 'SPA_BOOKING',
  'SPECIAL_ARRANGEMENT', 'OTHER',
];
