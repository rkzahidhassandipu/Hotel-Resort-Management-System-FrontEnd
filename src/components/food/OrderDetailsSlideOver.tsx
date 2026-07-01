"use client";
import { X, Calendar, MapPin, User, Hash } from "lucide-react";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import DateCell from "@/components/shared/cell/DateCell";
import type { FoodOrder } from "@/types";

interface OrderDetailsSlideOverProps {
  order: FoodOrder | null;
  onClose: () => void;
}

export default function OrderDetailsSlideOver({ order, onClose }: OrderDetailsSlideOverProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-[#1A1B21] border-l border-white/10 h-full overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-[#1A1B21] border-b border-white/5 p-5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-white font-semibold text-lg">Order Details</h2>
            <p className="text-[#37EFD1] text-xs font-mono mt-1">{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Status & Type */}
          <div className="flex items-center justify-between">
            <StatusBadgeCell status={order.status} />
            <span className="text-white/60 text-xs bg-white/5 px-2 py-1 rounded-md">
              {order.type.replace("_", " ")}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.03] rounded-lg p-3">
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                <MapPin size={12} />
                <span>Location</span>
              </div>
              <p className="text-white text-sm font-medium">
                {order.roomNumber ? `Room ${order.roomNumber}` : order.tableNumber ? `Table ${order.tableNumber}` : "—"}
              </p>
            </div>
            <div className="bg-white/[0.03] rounded-lg p-3">
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                <Hash size={12} />
                <span>Order ID</span>
              </div>
              <p className="text-white text-sm font-mono truncate">{order.id}</p>
            </div>
          </div>

          {order.customerId && (
            <div className="bg-white/[0.03] rounded-lg p-3">
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                <User size={12} />
                <span>Customer ID</span>
              </div>
              <p className="text-white text-sm font-mono">{order.customerId}</p>
            </div>
          )}

          {order.bookingId && (
            <div className="bg-white/[0.03] rounded-lg p-3">
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                <Calendar size={12} />
                <span>Booking ID</span>
              </div>
              <p className="text-white text-sm font-mono">{order.bookingId}</p>
            </div>
          )}

          {/* Items */}
          <div>
            <h3 className="text-white/70 text-sm font-medium mb-3">Items</h3>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="bg-white/[0.03] rounded-lg p-3 flex gap-3">
                  {item.menuItem?.imageUrl && (
                    <img
                      src={item.menuItem.imageUrl}
                      alt={item.menuItem.name}
                      className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm font-medium truncate">
                        {item.menuItem?.name ?? "Unknown item"}
                      </p>
                      <span className="text-white/60 text-xs ml-2 flex-shrink-0">x{item.quantity}</span>
                    </div>
                    {item.menuItem?.description && (
                      <p className="text-white/40 text-xs mt-0.5 truncate">{item.menuItem.description}</p>
                    )}
                    {item.notes && (
                      <p className="text-[#37EFD1] text-xs mt-1">Note: {item.notes}</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-white/40 text-xs">RM {Number(item.unitPrice).toFixed(2)} each</span>
                      <span className="text-white text-sm font-medium">RM {Number(item.totalPrice).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Notes */}
          {order.specialNotes && (
            <div className="bg-white/[0.03] rounded-lg p-3">
              <p className="text-white/40 text-xs mb-1">Special Notes</p>
              <p className="text-white text-sm">{order.specialNotes}</p>
            </div>
          )}

          {/* Price Summary */}
          <div className="bg-white/[0.03] rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Subtotal</span>
              <span className="text-white">RM {Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Tax</span>
              <span className="text-white">RM {Number(order.taxAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium pt-2 border-t border-white/5">
              <span className="text-white">Total</span>
              <span className="text-[#37EFD1]">RM {Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-white/70 text-sm font-medium mb-3">Timeline</h3>
            <div className="space-y-2">
              <TimelineRow label="Created" date={order.createdAt} />
              <TimelineRow label="Confirmed" date={order.confirmedAt} />
              <TimelineRow label="Preparing" date={order.preparingAt} />
              <TimelineRow label="Ready" date={order.readyAt} />
              <TimelineRow label="Delivered" date={order.deliveredAt} />
              <TimelineRow label="Cancelled" date={order.cancelledAt} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineRow({ label, date }: { label: string; date: string | null | undefined }) {
  if (!date) return null;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/40">{label}</span>
      <DateCell date={date} />
    </div>
  );
}