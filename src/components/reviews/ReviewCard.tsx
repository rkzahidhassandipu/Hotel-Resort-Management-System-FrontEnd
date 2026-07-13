'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { User, Pencil, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { reviewService } from '@/service/review.service';
import StarDisplay from './StarDisplay';
import StarPicker from './StarPicker';

interface Review {
  id: string;
  overallRating: number;
  title?: string;
  comment?: string;
  isAnonymous: boolean;
  createdAt: string;
  status: string;
  managerResponse?: string;
  booking?: { bookingNumber: string; room?: { roomNumber: string } };
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:  'bg-yellow-500/10 text-yellow-400',
  APPROVED: 'bg-[#37EFD1]/10 text-[#37EFD1]',
  REJECTED: 'bg-[#C8102E]/10 text-[#C8102E]',
  FLAGGED:  'bg-orange-500/10 text-orange-400',
};

const inputCls = 'w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3 py-2.5 rounded-lg focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20 outline-none';

export default function ReviewCard({ review, onUpdated }: {
  review: Review;
  onUpdated: (updated: Review) => void;
}) {
  const [editing, setEditing]     = useState(false);
  const [rating, setRating]       = useState(review.overallRating);
  const [title, setTitle]         = useState(review.title ?? '');
  const [comment, setComment]     = useState(review.comment ?? '');
  const [anonymous, setAnonymous] = useState(review.isAnonymous);

  const updateMut = useMutation({
    mutationFn: () => reviewService.update(review.id, {
      overallRating: rating,
      title: title.trim() || undefined,
      comment: comment.trim() || undefined,
      isAnonymous: anonymous,
    }),
    onSuccess: (res) => {
      toast.success('Review updated');
      onUpdated(res.data?.data ?? res.data);
      setEditing(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to update'),
  });

  const handleCancel = () => {
    setEditing(false);
    setRating(review.overallRating);
    setTitle(review.title ?? '');
    setComment(review.comment ?? '');
    setAnonymous(review.isAnonymous);
  };

  return (
    <div className="bg-[#1A1B21] border border-white/8 rounded-2xl p-5 space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          {editing ? <StarPicker value={rating} onChange={setRating} /> : <StarDisplay rating={review.overallRating} />}
          {!editing && review.title && (
            <p className="text-white font-sans font-medium text-sm">{review.title}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-sans px-2.5 py-1 rounded-full ${STATUS_BADGE[review.status] ?? 'bg-white/5 text-white/40'}`}>
            {review.status}
          </span>
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all">
              <Pencil size={13} />
            </button>
          )}
        </div>
      </div>

      {/* View mode */}
      {!editing && review.comment && (
        <p className="text-white/60 text-sm font-sans leading-relaxed">{review.comment}</p>
      )}

      {/* Edit mode */}
      {editing && (
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-white/40 text-xs font-sans mb-1.5 block">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} maxLength={100}
              placeholder="Summarize your experience" className={inputCls} />
          </div>
          <div>
            <label className="text-white/40 text-xs font-sans mb-1.5 block">Comment</label>
            <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
              maxLength={1000} placeholder="Tell us about your stay..."
              className={`${inputCls} resize-none`} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)}
              className="accent-[#37EFD1]" />
            <span className="text-white/50 text-sm font-sans">Post anonymously</span>
          </label>
          <div className="flex gap-2">
            <button onClick={() => updateMut.mutate()} disabled={updateMut.isPending}
              className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
              {updateMut.isPending && <Loader2 size={13} className="animate-spin" />}
              Save Changes
            </button>
            <button onClick={handleCancel}
              className="px-4 py-2 rounded-lg text-sm font-sans text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-white/30 font-sans flex-wrap">
        {review.isAnonymous && <span className="flex items-center gap-1"><User className="h-3 w-3" /> Anonymous</span>}
        {review.booking && <span>Booking #{review.booking.bookingNumber}</span>}
        {review.booking?.room && <span>Room {review.booking.room.roomNumber}</span>}
        <span>{new Date(review.createdAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>

      {/* Manager response */}
      {!editing && review.managerResponse && (
        <div className="bg-[#0B0C10] border border-white/8 rounded-xl p-3">
          <p className="text-[#37EFD1] text-xs font-sans font-medium mb-1">Management Response</p>
          <p className="text-white/60 text-sm font-sans">{review.managerResponse}</p>
        </div>
      )}
    </div>
  );
}