export type StockStatus = 'SUFFICIENT' | 'LOW' | 'OUT_OF_STOCK' | 'OVERSTOCKED';
export type ProcurementStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
export type TransactionType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'WASTAGE' | 'TRANSFER' | 'RETURN';

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  _count?: { items: number };
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  reorderPoint: number;
  unitCost: number;
  supplier?: string;
  location?: string;
  status: StockStatus;
  notes?: string;
  categoryId: string;
  category?: InventoryCategory;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: TransactionType;
  quantity: number;
  notes?: string;
  createdAt: string;
}

export interface ProcurementItem {
  inventoryItemId: string;
  quantity: number;
  unitCost: number;
}

export interface ProcurementOrder {
  id: string;
  orderNumber: string;
  status: ProcurementStatus;
  supplier?: string;
  totalAmount?: number;
  expectedDate?: string;
  notes?: string;
  createdAt: string;
  requestedBy?: { firstName: string; lastName: string };
  items?: { inventoryItem: { name: string; sku: string }; quantity: number; unitCost: number }[];
}

export interface InventoryStats {
  total: number;
  byStatus: { status: StockStatus; _count: { status: number } }[];
  totalStockUnits: number;
  lowStockAlerts: number;
  categories: number;
}

export const STOCK_STATUS_CFG: Record<StockStatus, { label: string; color: string; bgClass: string }> = {
  SUFFICIENT:   { label: 'Sufficient',   color: 'text-green-400',  bgClass: 'bg-green-400/10' },
  LOW:          { label: 'Low',          color: 'text-yellow-400', bgClass: 'bg-yellow-400/10' },
  OUT_OF_STOCK: { label: 'Out of Stock', color: 'text-red-400',    bgClass: 'bg-red-400/10' },
  OVERSTOCKED:  { label: 'Overstocked',  color: 'text-blue-400',   bgClass: 'bg-blue-400/10' },
};

export const PROCUREMENT_STATUS_CFG: Record<ProcurementStatus, { label: string; color: string; bgClass: string }> = {
  DRAFT:      { label: 'Draft',      color: 'text-white/40',   bgClass: 'bg-white/5' },
  SUBMITTED:  { label: 'Submitted',  color: 'text-blue-400',   bgClass: 'bg-blue-400/10' },
  APPROVED:   { label: 'Approved',   color: 'text-[#37EFD1]',  bgClass: 'bg-[#37EFD1]/10' },
  ORDERED:    { label: 'Ordered',    color: 'text-purple-400', bgClass: 'bg-purple-400/10' },
  RECEIVED:   { label: 'Received',   color: 'text-green-400',  bgClass: 'bg-green-400/10' },
  CANCELLED:  { label: 'Cancelled',  color: 'text-red-400',    bgClass: 'bg-red-400/10' },
};

export const inputCls = 'w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3 py-2 rounded-lg outline-none focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20';
export const selectCls = `${inputCls} cursor-pointer`;

export const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';