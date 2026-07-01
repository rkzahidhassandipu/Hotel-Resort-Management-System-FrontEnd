'use client';
import { ArrowRight, Calendar, CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from 'next/navigation';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');
 
  const bookingNumber = searchParams.get('bookingNumber');

  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-[#37EFD1]/10 border border-[#37EFD1]/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-[#37EFD1]" />
        </div>
        <h1 className="font-display text-3xl text-white font-semibold mb-2">Booking Confirmed!</h1>
        <p className="text-white/40 font-sans text-sm mb-8">
          Your reservation has been successfully placed. You will receive a confirmation email shortly.
        </p>
        {/* ✅ bookingNumber দেখাও, id না */}
        {bookingNumber && (
          <div className="bg-[#1A1B21] border border-white/8 rounded-xl px-5 py-4 mb-6 inline-block">
            <p className="text-white/40 text-xs font-sans">Booking Reference</p>
            <p className="text-[#37EFD1] font-mono text-sm mt-1">{bookingNumber}</p>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push('/customer/dashboard/bookings')}
            className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white font-sans font-medium px-6 py-2.5 rounded-lg transition-all text-sm"
          >
            <Calendar className="h-4 w-4" /> My Bookings
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 font-sans font-medium px-6 py-2.5 rounded-lg transition-all text-sm"
          >
            Back Home <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}