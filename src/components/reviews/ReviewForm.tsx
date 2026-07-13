'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import StarPicker from './StarPicker';

interface ReviewableBooking {
  id: string;
  bookingNumber: string;
  room?: { roomNumber: string };
}

interface Props {
  reviewableBookings: ReviewableBooking[];
  bookingsLoading: boolean;
  onSubmit: (data: {
    bookingId?: string;
    overallRating: number;
    title?: string;
    comment?: string;
    isAnonymous: boolean;
  }) => Promise<unknown>;
  onCancel: () => void;
}

const inputCls = 'w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3 py-2.5 rounded-lg focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20 outline-none';

export default function ReviewForm({ reviewableBookings, bookingsLoading, onSubmit, onCancel }: Props) {
  const [rating, setRating]         = useState(5);
  const [title, setTitle]           = useState('');
  const [comment, setComment]       = useState('');
  const [anonymous, setAnonymous]   = useState(false);
  const [bookingId, setBookingId]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewableBookings.length > 0 && !bookingId) {
      setError('Please select which stay this review is for.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ bookingId: bookingId || undefined, overallRating: rating,
        title: title.trim() || undefined, comment: comment.trim() || undefined, isAnonymous: anonymous });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1A1B21] border border-[#37EFD1]/20 rounded-2xl p-6 space-y-4">
      <h2 className="text-white font-display font-semibold">Write a Review</h2>

      {error && (
        <div className="bg-[#C8102E]/10 border border-[#C8102E]/20 rounded-lg px-4 py-3 text-[#C8102E] text-sm font-sans">{error}</div>
      )}

      {/* Booking selector */}
      <div>
        <label className="text-white/50 text-xs uppercase tracking-widest font-sans mb-1 block">Stay</label>
        {bookingsLoading ? (
          <div className="flex items-center gap-2 text-white/40 text-sm font-sans py-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...
          </div>
        ) : reviewableBookings.length === 0 ? (
          <p className="text-white/30 text-sm font-sans">No checked-out stays available to review.</p>
        ) : (
          <select value={bookingId} onChange={e => setBookingId(e.target.value)} className={inputCls}>
            <option value="">Select a stay to review</option>
            {reviewableBookings.map(b => (
              <option key={b.id} value={b.id}>
                Booking #{b.bookingNumber}{b.room ? ` — Room ${b.room.roomNumber}` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="text-white/50 text-xs uppercase tracking-widest font-sans mb-2 block">Overall Rating</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="text-white/50 text-xs uppercase tracking-widest font-sans mb-1 block">
          Title <span className="text-white/25 normal-case">(optional)</span>
        </label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          maxLength={100} placeholder="Summarize your experience" className={inputCls} />
      </div>

      <div>
        <label className="text-white/50 text-xs uppercase tracking-widest font-sans mb-1 block">
          Comment <span className="text-white/25 normal-case">(optional)</span>
        </label>
        <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
          maxLength={1000} placeholder="Tell us about your stay..."
          className={`${inputCls} resize-none`} />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="accent-[#37EFD1]" />
        <span className="text-white/50 text-sm font-sans">Post anonymously</span>
      </label>

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={submitting}
          className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit Review
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 rounded-lg text-sm font-sans text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-all">
          Cancel
        </button>
      </div>
    </form>
  );
}