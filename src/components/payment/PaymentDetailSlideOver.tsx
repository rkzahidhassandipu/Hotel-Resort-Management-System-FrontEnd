'use client';
import { useQuery } from '@tanstack/react-query';
import {
  X, CreditCard, FileText, Loader2, CheckCircle,
  XCircle, Clock, RefreshCw, User, BookOpen,
} from 'lucide-react';
import { paymentService } from '@/service/payment.service';

interface Props {
  paymentId: string | null;
  onClose: () => void;
}

export default function PaymentDetailSlideOver({ paymentId, onClose }: Props) {
  const open = !!paymentId;

  const { data, isLoading } = useQuery({
    queryKey: ['payment', 'detail', paymentId],
    queryFn: () => paymentService.getById(paymentId!),
    enabled: open,
    select: (res) => (res.data?.data ?? res.data) as any,
  });

  const statusConfig: Record<string, { icon: React.ReactNode; class: string; bg: string }> = {
    COMPLETED:          { icon: <CheckCircle className="h-4 w-4" />, class: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
    PENDING:            { icon: <Clock className="h-4 w-4" />,       class: 'text-yellow-400',  bg: 'bg-yellow-400/10 border-yellow-400/20'  },
    FAILED:             { icon: <XCircle className="h-4 w-4" />,     class: 'text-[#C8102E]',   bg: 'bg-[#C8102E]/10 border-[#C8102E]/20'   },
    REFUNDED:           { icon: <RefreshCw className="h-4 w-4" />,   class: 'text-orange-400',  bg: 'bg-orange-400/10 border-orange-400/20'  },
    PARTIALLY_REFUNDED: { icon: <RefreshCw className="h-4 w-4" />,   class: 'text-yellow-400',  bg: 'bg-yellow-400/10 border-yellow-400/20'  },
  };

  const sc = data ? (statusConfig[data.status] ?? statusConfig.PENDING) : null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-[#13141A] border-l border-white/8 z-50
          flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <div>
            <p className="text-[#37EFD1] text-xs font-sans tracking-widest uppercase">Payment Detail</p>
            <h2 className="font-mono text-sm text-white/70 mt-0.5">
              {data?.paymentNumber ?? 'Loading...'}
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
              {/* Status Badge */}
              {sc && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border w-fit ${sc.bg} ${sc.class}`}>
                  {sc.icon}
                  <span className="text-sm font-sans font-medium">
                    {data.status.replace(/_/g, ' ')}
                  </span>
                </div>
              )}

              {/* Amount Hero */}
              <div className="bg-[#1A1B21] border border-white/8 rounded-xl p-5 text-center">
                <p className="text-white/40 text-xs font-sans uppercase tracking-widest mb-1">Amount</p>
                <p className={`font-display text-3xl font-semibold ${
                  data.status === 'REFUNDED' ? 'text-orange-400 line-through' : 'text-[#37EFD1]'
                }`}>
                  {data.currency} {Number(data.amount).toFixed(2)}
                </p>
                {data.status === 'REFUNDED' && data.refundAmount && (
                  <p className="text-orange-400 text-sm font-sans mt-1">
                    Refunded: {data.currency} {Number(data.refundAmount).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Payment Info */}
              <Section icon={<CreditCard className="h-4 w-4" />} title="Payment Info">
                <Row label="Method"   value={data.method.replace(/_/g, ' ')} />
                <Row label="Currency" value={data.currency} />
                {data.transactionId && (
                  <Row
                    label="Transaction ID"
                    value={data.transactionId}
                    valueClass="text-white font-mono text-xs break-all"
                  />
                )}
                {data.notes && <Row label="Notes" value={data.notes} />}
                {data.paidAt && (
                  <Row
                    label="Paid At"
                    value={new Date(data.paidAt).toLocaleString('en-MY', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  />
                )}
                <Row
                  label="Created"
                  value={new Date(data.createdAt).toLocaleString('en-MY', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                />
              </Section>

              {/* Guest */}
              {data.user && (
                <Section icon={<User className="h-4 w-4" />} title="Guest">
                  <Row label="Name"  value={`${data.user.firstName} ${data.user.lastName}`} />
                  <Row label="Email" value={data.user.email} />
                </Section>
              )}

              {/* Booking */}
              {data.booking && (
                <Section icon={<BookOpen className="h-4 w-4" />} title="Booking">
                  <Row
                    label="Booking #"
                    value={data.booking.bookingNumber}
                    valueClass="text-[#37EFD1] font-mono text-xs"
                  />
                  <Row label="Check-in"
                    value={new Date(data.booking.checkInDate).toLocaleDateString('en-MY', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  />
                  <Row
                    label="Check-out"
                    value={new Date(data.booking.checkOutDate).toLocaleDateString('en-MY', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  />
                  <Row label="Nights" value={data.booking.nights} />
                  <Row
                    label="Total"
                    value={`${data.currency} ${Number(data.booking.totalAmount).toFixed(2)}`}
                  />
                </Section>
              )}

              {/* Invoice */}
              {data.invoice && (
                <Section icon={<FileText className="h-4 w-4" />} title="Invoice">
                  <Row
                    label="Invoice #"
                    value={data.invoice.invoiceNumber}
                    valueClass="text-[#37EFD1] font-mono text-xs"
                  />
                  <Row label="Status"   value={data.invoice.status} />
                  <Row label="Subtotal" value={`${data.currency} ${Number(data.invoice.subtotal).toFixed(2)}`} />
                  <Row label="Tax"      value={`${data.invoice.taxRate}%`} />
                  <div className="border-t border-white/5 pt-2 mt-1">
                    <Row
                      label="Total"
                      value={`${data.currency} ${Number(data.invoice.totalAmount).toFixed(2)}`}
                      valueClass="text-[#37EFD1] font-semibold"
                    />
                  </div>
                  {data.invoice.items?.length > 0 && (
                    <div className="border-t border-white/5 pt-2 space-y-1">
                      {data.invoice.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-xs font-sans text-white/50">
                          <span>{item.description}</span>
                          <span>{data.currency} {Number(item.totalPrice).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {/* Refund */}
              {(data.status === 'REFUNDED' || data.status === 'PARTIALLY_REFUNDED') && (
                <Section icon={<RefreshCw className="h-4 w-4 text-orange-400" />} title="Refund">
                  {data.refundAmount && (
                    <Row
                      label="Refund Amount"
                      value={`${data.currency} ${Number(data.refundAmount).toFixed(2)}`}
                      valueClass="text-orange-400 font-semibold"
                    />
                  )}
                  {data.refundReason && <Row label="Reason" value={data.refundReason} />}
                  {data.refundedAt && (
                    <Row
                      label="Refunded At"
                      value={new Date(data.refundedAt).toLocaleString('en-MY', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    />
                  )}
                </Section>
              )}
            </>
          ) : (
            <p className="text-white/40 text-sm font-sans text-center py-20">
              Could not load payment details.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function Section({
  icon, title, children,
}: {
  icon: React.ReactNode; title: string; children: React.ReactNode;
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
  label, value, valueClass,
}: {
  label: string; value: string | number; valueClass?: string;
}) {
  return (
    <div className="flex justify-between text-sm font-sans">
      <span className="text-white/40">{label}</span>
      <span className={valueClass ?? 'text-white'}>{value}</span>
    </div>
  );
}