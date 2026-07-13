'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { reviewService } from '@/service/review.service';
import { bookingService } from '@/service/booking.service';
import ReviewForm from './ReviewForm';
import ReviewCard from './ReviewCard';

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

interface ReviewableBooking {
  id: string;
  bookingNumber: string;
  status: string;
  _count?: { reviews: number };
  room?: { roomNumber: string };
}

export default function MyReviewsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: async () => {
      const res = await reviewService.getMyReviews();
      return (res.data?.data ?? res.data ?? []) as Review[];
    },
  });

  const { data: reviewableBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-bookings-reviewable'],
    queryFn: async () => {
      const res = await bookingService.getMyBookings();
      const bookings: ReviewableBooking[] = res.data?.data ?? res.data ?? [];
      // ✅ CHECKED_OUT এবং review নেই এমন bookings
      return bookings.filter(b => b.status === 'CHECKED_OUT' && (b._count?.reviews ?? 0) === 0);
    },
  });

  const createMut = useMutation({
    mutationFn: (data: unknown) => reviewService.create(data),
    onSuccess: () => {
      toast.success('Review submitted');
      qc.invalidateQueries({ queryKey: ['my-reviews'] });
      qc.invalidateQueries({ queryKey: ['my-bookings-reviewable'] });
      setShowForm(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to submit review'),
  });

  const handleUpdated = (updated: Review) => {
    qc.setQueryData(['my-reviews'], (old: Review[] = []) =>
      old.map(r => r.id === updated.id ? updated : r)
    );
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-5 w-5 animate-spin text-white/30" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white font-display font-semibold">My Reviews</h1>
          <p className="text-white/40 text-sm font-sans mt-0.5">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
        {reviewableBookings.length > 0 && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#37EFD1] hover:bg-[#00FFD5] text-[#0B0C10] px-4 py-2 rounded-lg text-sm font-semibold transition-all">
            <Plus className="h-4 w-4" /> Write Review
          </button>
        )}
      </div>

      {showForm && (
        <ReviewForm
          reviewableBookings={reviewableBookings}
          bookingsLoading={bookingsLoading}
          onSubmit={async (data) => createMut.mutateAsync(data)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {reviews.length === 0 ? (
        <div className="bg-[#1A1B21] border border-white/8 rounded-2xl p-12 text-center">
          <MessageSquare className="h-8 w-8 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 font-sans text-sm">No reviews yet. Share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} onUpdated={handleUpdated} />
          ))}
        </div>
      )}
    </div>
  );
}