'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Users, ArrowRight, Loader2, BedDouble } from 'lucide-react';
import { bookingService } from '@/service/booking.service';
import { getCookie } from '@/lib/cookieUtils';

export default function BookingPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const isLoggedIn = !!getCookie('accessToken');

  const [form, setForm] = useState({
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    specialRequests: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate nights
  const nights =
    form.checkInDate && form.checkOutDate
      ? Math.max(
          0,
          Math.ceil(
            (new Date(form.checkOutDate).getTime() - new Date(form.checkInDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // If not logged in → redirect to login with redirect back
    if (!isLoggedIn) {
      router.push(`/login?redirect=/book/${roomId}`);
      return;
    }

    if (nights < 1) {
      setError('Check-out must be after check-in.');
      return;
    }

    setLoading(true);
    try {
      const res = await bookingService.create({
        roomId,
        checkInDate: new Date(form.checkInDate).toISOString(),
        checkOutDate: new Date(form.checkOutDate).toISOString(),
        adults: form.adults,
        children: form.children,
        specialRequests: form.specialRequests || undefined,
      });

      const booking = res.data?.data || res.data;
      // Go to confirmation + payment page
      router.push(`/book/${roomId}/confirm?bookingId=${booking.id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Booking failed. Please try again.';
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[#37EFD1] text-xs font-sans tracking-widest uppercase mb-2">
            Reservation
          </p>
          <h1 className="font-display text-3xl text-white font-semibold">Book Your Stay</h1>
          <p className="text-white/40 text-sm font-sans mt-1">
            Room: <span className="text-white/70">{decodeURIComponent(roomId)}</span>
          </p>
        </div>

        <div className="bg-[#1A1B21] border border-white/8 rounded-2xl overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-[#C8102E]/50 to-transparent" />
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-[#C8102E]/10 border border-[#C8102E]/20 rounded-lg px-4 py-3 text-[#C8102E] text-sm font-sans">
                {error}
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/50 text-xs font-sans uppercase tracking-widest mb-2 block">
                  Check-in
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={form.checkInDate}
                    onChange={e => setForm(f => ({ ...f, checkInDate: e.target.value }))}
                    className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/50 text-xs font-sans uppercase tracking-widest mb-2 block">
                  Check-out
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <input
                    type="date"
                    required
                    min={form.checkInDate || new Date().toISOString().split('T')[0]}
                    value={form.checkOutDate}
                    onChange={e => setForm(f => ({ ...f, checkOutDate: e.target.value }))}
                    className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Nights summary */}
            {nights > 0 && (
              <div className="bg-[#37EFD1]/8 border border-[#37EFD1]/15 rounded-lg px-4 py-3">
                <p className="text-[#37EFD1] text-sm font-sans">
                  <span className="font-semibold">{nights} night{nights > 1 ? 's' : ''}</span>
                  {' '}selected
                </p>
              </div>
            )}

            {/* Guests */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/50 text-xs font-sans uppercase tracking-widest mb-2 block">
                  Adults
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <select
                    value={form.adults}
                    onChange={e => setForm(f => ({ ...f, adults: Number(e.target.value) }))}
                    className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors appearance-none"
                  >
                    {[1, 2, 3, 4].map(n => (
                      <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-white/50 text-xs font-sans uppercase tracking-widest mb-2 block">
                  Children
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <select
                    value={form.children}
                    onChange={e => setForm(f => ({ ...f, children: Number(e.target.value) }))}
                    className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors appearance-none"
                  >
                    {[0, 1, 2, 3].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Child' : 'Children'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="text-white/50 text-xs font-sans uppercase tracking-widest mb-2 block">
                Special Requests <span className="text-white/25">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={form.specialRequests}
                onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))}
                placeholder="Early check-in, dietary requirements, etc."
                className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-4 py-3 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors resize-none placeholder:text-white/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C8102E] hover:bg-[#a00d24] disabled:opacity-60 text-white font-sans font-medium py-3.5 rounded-lg transition-all hover:shadow-lg hover:shadow-[#C8102E]/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isLoggedIn ? 'Continue to Payment' : 'Login to Book'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}