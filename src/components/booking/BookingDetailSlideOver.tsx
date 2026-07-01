"use client";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  BedDouble,
  Calendar,
  Users,
  CreditCard,
  Clock,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { bookingService } from "@/service/booking.service";
import type { Booking } from "@/types";

interface Props {
  bookingId: string | null;
  onClose: () => void;
}

export default function BookingDetailSlideOver({ bookingId, onClose }: Props) {
  const open = !!bookingId;

  const { data, isLoading } = useQuery({
    queryKey: ["booking", "detail", bookingId],
    queryFn: () => bookingService.getById(bookingId!),
    enabled: open,
    select: (res) => (res.data?.data ?? res.data) as Booking,
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-[#13141A] border-l border-white/8 z-50
          flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <div>
            <p className="text-[#37EFD1] text-xs font-sans tracking-widest uppercase">
              Booking Detail
            </p>
            <h2 className="text-white font-display text-lg font-semibold mt-0.5">
              {data?.bookingNumber ? (
                <span className="font-mono text-sm text-white/70">
                  {data.bookingNumber}
                </span>
              ) : (
                "Loading..."
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 animate-spin text-white/30" />
            </div>
          ) : data ? (
            <>
              {/* Status */}
              <div className="flex items-center justify-between">
                <StatusBadgeCell status={data.status} />
                <span className="text-white/40 text-xs font-sans">
                  Created{" "}
                  {new Date(data.createdAt).toLocaleDateString("en-MY", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Guest */}
              <Section icon={<Users className="h-4 w-4" />} title="Guest">
                <Row
                  label="Name"
                  value={`${data.customer?.firstName ?? ""} ${data.customer?.lastName ?? ""}`}
                />
                <Row label="Email" value={data.customer?.email ?? "—"} />
              </Section>

              {/* Room */}
              <Section icon={<BedDouble className="h-4 w-4" />} title="Room">
                <Row label="Room No." value={data.room?.roomNumber ?? "—"} />
                <Row label="Nights" value={data.nights} />
                <Row label="Adults" value={data.adults} />
                {data.children > 0 && (
                  <Row label="Children" value={data.children} />
                )}
                {data.specialRequests && (
                  <Row label="Special Requests" value={data.specialRequests} />
                )}
              </Section>

              {/* Dates */}
              <Section icon={<Calendar className="h-4 w-4" />} title="Dates">
                <Row
                  label="Check-in"
                  value={new Date(data.checkInDate).toLocaleDateString(
                    "en-MY",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                />
                <Row
                  label="Check-out"
                  value={new Date(data.checkOutDate).toLocaleDateString(
                    "en-MY",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                />
                {data.actualCheckIn && (
                  <Row
                    label="Actual Check-in"
                    value={new Date(data.actualCheckIn).toLocaleString("en-MY")}
                  />
                )}
                {data.actualCheckOut && (
                  <Row
                    label="Actual Check-out"
                    value={new Date(data.actualCheckOut).toLocaleString(
                      "en-MY",
                    )}
                  />
                )}
                {data.arrivalTime && (
                  <Row label="Arrival Time" value={data.arrivalTime} />
                )}
              </Section>

              {/* Pricing */}
              <Section
                icon={<CreditCard className="h-4 w-4" />}
                title="Pricing"
              >
                <Row
                  label="Price / Night"
                  value={`RM ${Number(data.pricePerNight).toFixed(2)}`}
                />
                <Row
                  label="Subtotal"
                  value={`RM ${Number(data.subtotal).toFixed(2)}`}
                />
                <Row
                  label="Tax (15%)"
                  value={`RM ${Number(data.taxAmount).toFixed(2)}`}
                />
                {Number(data.discountAmount) > 0 && (
                  <Row
                    label="Discount"
                    value={`– RM ${Number(data.discountAmount).toFixed(2)}`}
                  />
                )}
                <div className="border-t border-white/5 pt-2 mt-1">
                  <Row
                    label="Total"
                    value={`RM ${Number(data.totalAmount).toFixed(2)}`}
                    valueClass="text-[#37EFD1] font-semibold"
                  />
                </div>
              </Section>

              {/* Payments */}
              {/* Payments */}
              {data.payments && data.payments.length > 0 && (
                <Section
                  icon={<FileText className="h-4 w-4" />}
                  title="Payments"
                >
                  {data.payments.map((p: any) => (
                    <div key={p.id} className="space-y-1">
                      <div className="flex justify-between items-center text-sm font-sans py-1">
                        <div className="flex items-center gap-2">
                          {p.status === "COMPLETED" && (
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          )}
                          {p.status === "REFUNDED" && (
                            <CheckCircle className="h-3.5 w-3.5 text-orange-400" />
                          )}
                          {p.status === "PARTIALLY_REFUNDED" && (
                            <CheckCircle className="h-3.5 w-3.5 text-yellow-400" />
                          )}
                          {![
                            "COMPLETED",
                            "REFUNDED",
                            "PARTIALLY_REFUNDED",
                          ].includes(p.status) && (
                            <XCircle className="h-3.5 w-3.5 text-white/30" />
                          )}
                          <span className="text-white/50">
                            {p.method.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              p.status === "REFUNDED"
                                ? "text-orange-400 line-through"
                                : p.status === "PARTIALLY_REFUNDED"
                                  ? "text-yellow-400"
                                  : "text-white"
                            }
                          >
                            RM {Number(p.amount).toFixed(2)}
                          </span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded font-sans ${
                              p.status === "COMPLETED"
                                ? "bg-emerald-400/10 text-emerald-400"
                                : p.status === "REFUNDED"
                                  ? "bg-orange-400/10 text-orange-400"
                                  : p.status === "PARTIALLY_REFUNDED"
                                    ? "bg-yellow-400/10 text-yellow-400"
                                    : "bg-white/5 text-white/30"
                            }`}
                          >
                            {p.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                      {p.status === "REFUNDED" && p.refundAmount && (
                        <div className="flex justify-between text-xs font-sans text-orange-400/70 pl-5">
                          <span>Refunded</span>
                          <span>RM {Number(p.refundAmount).toFixed(2)}</span>
                        </div>
                      )}
                      {p.refundedAt && (
                        <div className="flex justify-between text-xs font-sans text-white/30 pl-5">
                          <span>Refund Date</span>
                          <span>
                            {new Date(p.refundedAt).toLocaleDateString(
                              "en-MY",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </Section>
              )}

              {/* Cancellation */}
              {data.cancellationReason && (
                <Section
                  icon={<XCircle className="h-4 w-4 text-[#C8102E]" />}
                  title="Cancellation"
                >
                  <Row label="Reason" value={data.cancellationReason} />
                  {data.cancelledAt && (
                    <Row
                      label="Cancelled At"
                      value={new Date(data.cancelledAt).toLocaleString("en-MY")}
                    />
                  )}
                </Section>
              )}
            </>
          ) : (
            <p className="text-white/40 text-sm font-sans text-center py-20">
              Could not load booking details.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#1A1B21] border border-white/8 rounded-xl p-4 space-y-2.5">
      <h3 className="text-white/60 text-xs font-sans uppercase tracking-widest flex items-center gap-1.5">
        <span className="text-[#37EFD1]">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between text-sm font-sans">
      <span className="text-white/40">{label}</span>
      <span className={valueClass ?? "text-white"}>{value}</span>
    </div>
  );
}
