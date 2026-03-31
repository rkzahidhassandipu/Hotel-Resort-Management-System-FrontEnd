'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, CreditCard, Loader2, ArrowRight, BedDouble, Calendar } from 'lucide-react';
import { bookingService } from '@/service/booking.service';
import { paymentService } from '@/service/payment.service';
import type { Booking } from '@/types';

const PAYMENT_METHODS = [
  { value: 'CASH',           label: 'Cash at Reception' },
  { value: 'CREDIT_CARD',    label: 'Credit Card' },
  { value: 'DEBIT_CARD',     label: 'Debit Card' },
  { value: 'BANK_TRANSFER',  label: 'Bank Transfer' },
  { value: 'ONLINE_PAYMENT', label: 'Online Payment' },
  { value: 'MOBILE_BANKING', label: 'Mobile Banking' },
];

export default function BookingConfirmPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const bookingId    = searchParams.get('bookingId') ?? '';

  const [booking,  setBooking]  = useState<Booking | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [paying,   setPaying]   = useState(false);
  const [error,    setError]    = useState('');
  const [method,   setMethod]   = useState('CASH');
  const [notes,    setNotes]    = useState('');

  useEffect(() => {
    if (!bookingId) { router.push('/'); return; }
    bookingService.getById(bookingId)
      .then(res => setBooking(res.data?.data || res.data))
      .catch(() => setError('Could not load booking details.'))
      .finally(() => setLoading(false));
  }, [bookingId, router]);

  const handlePay = async () => {
    if (!booking) return;
    setPaying(true);
    setError('');
    try {
      await paymentService.create({
        bookingId: booking.id,
        amount:    Number(booking.totalAmount),
        method,
        currency:  'MYR',
        notes:     notes || undefined,
      });
      router.push(`/book/success?bookingId=${booking.id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Payment failed. Please try again.';
      setError(msg);
    }
    setPaying(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-white/30" />
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
      <p className="text-white/40 font-sans">Booking not found.</p>
    </div>
  );

  const checkIn  = new Date(booking.checkInDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
  const checkOut = new Date(booking.checkOutDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#0B0C10] pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6 space-y-6">
        <div>
          <p className="text-[#37EFD1] text-xs font-sans tracking-widest uppercase mb-2">Step 2 of 2</p>
          <h1 className="font-display text-3xl text-white font-semibold">Review & Pay</h1>
        </div>

        {/* Booking Summary */}
        <div className="bg-[#1A1B21] border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-display text-base font-semibold mb-4 flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-[#37EFD1]" /> Booking Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-sans">
              <span className="text-white/50">Booking #</span>
              <span className="text-[#37EFD1] font-mono text-xs">{booking.bookingNumber}</span>
            </div>
            <div className="flex justify-between text-sm font-sans">
              <span className="text-white/50">Room</span>
              <span className="text-white">{booking.room?.roomNumber ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm font-sans">
              <span className="text-white/50 flex items-center gap-1"><Calendar className="h-3 w-3" />Check-in</span>
              <span className="text-white">{checkIn}</span>
            </div>
            <div className="flex justify-between text-sm font-sans">
              <span className="text-white/50 flex items-center gap-1"><Calendar className="h-3 w-3" />Check-out</span>
              <span className="text-white">{checkOut}</span>
            </div>
            <div className="flex justify-between text-sm font-sans">
              <span className="text-white/50">Nights</span>
              <span className="text-white">{booking.nights}</span>
            </div>
            <div className="flex justify-between text-sm font-sans">
              <span className="text-white/50">Guests</span>
              <span className="text-white">{booking.adults} adult{booking.adults > 1 ? 's' : ''}{booking.children > 0 ? `, ${booking.children} children` : ''}</span>
            </div>
            <div className="border-t border-white/5 pt-3 mt-3 space-y-1.5">
              <div className="flex justify-between text-sm font-sans">
                <span className="text-white/50">Room Rate</span>
                <span className="text-white">RM {Number(booking.pricePerNight).toFixed(2)} × {booking.nights} nights</span>
              </div>
              <div className="flex justify-between text-sm font-sans">
                <span className="text-white/50">Subtotal</span>
                <span className="text-white">RM {Number(booking.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-sans">
                <span className="text-white/50">Tax (15%)</span>
                <span className="text-white">RM {Number(booking.taxAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-sans font-semibold pt-2 border-t border-white/5">
                <span className="text-white">Total</span>
                <span className="text-[#37EFD1] text-lg">RM {Number(booking.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-[#1A1B21] border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-display text-base font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#37EFD1]" /> Payment Method
          </h2>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {PAYMENT_METHODS.map(pm => (
              <button
                key={pm.value}
                type="button"
                onClick={() => setMethod(pm.value)}
                className={`px-4 py-2.5 rounded-lg text-sm font-sans text-left transition-all border ${
                  method === pm.value
                    ? 'bg-[#C8102E]/15 border-[#C8102E]/40 text-white'
                    : 'bg-[#0B0C10] border-white/8 text-white/50 hover:border-white/20 hover:text-white/70'
                }`}
              >
                {pm.label}
              </button>
            ))}
          </div>
          <div>
            <label className="text-white/50 text-xs font-sans uppercase tracking-widest mb-2 block">
              Notes <span className="text-white/25">(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. transaction reference"
              className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-4 py-3 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20"
            />
          </div>
        </div>

        {error && (
          <div className="bg-[#C8102E]/10 border border-[#C8102E]/20 rounded-lg px-4 py-3 text-[#C8102E] text-sm font-sans">
            {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full bg-[#C8102E] hover:bg-[#a00d24] disabled:opacity-60 text-white font-sans font-medium py-3.5 rounded-lg transition-all hover:shadow-lg hover:shadow-[#C8102E]/25 flex items-center justify-center gap-2"
        >
          {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Confirm & Pay RM {Number(booking.totalAmount).toFixed(2)} <ArrowRight className="h-4 w-4" /></>}
        </button>

        <p className="text-center text-white/25 text-xs font-sans">
          By confirming, you agree to our cancellation and refund policy.
        </p>
      </div>
    </div>
  );
}