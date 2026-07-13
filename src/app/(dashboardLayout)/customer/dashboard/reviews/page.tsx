"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, MessageSquare, Pencil } from "lucide-react";
import { toast } from "sonner";
import { reviewService } from "@/service/review.service";
import { bookingService } from "@/service/booking.service";
import ReviewForm from "@/components/reviews/ReviewForm";
import ReviewCard from "@/components/reviews/ReviewCard";

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
  hasReview?: boolean;
  room?: { roomNumber: string };
}

export default function MyReviewsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["my-reviews"],
    queryFn: async () => {
      const res = await reviewService.getMyReviews();
      console.log("my reviews:", res.data);
      return (res.data?.data ?? res.data ?? []) as Review[];
    },
  });

  const { data: reviewableBookings = [], isLoading: bookingsLoading } =
    useQuery({
      queryKey: ["my-bookings-reviewable"],
      queryFn: async () => {
        const res = await bookingService.getMyBookings();
        const bookings = res.data?.data ?? res.data ?? [];
        console.log(
          "raw bookings:",
          bookings.map((b: any) => ({
            id: b.id,
            status: b.status,
            hasReview: b.hasReview,
          })),
        );
        return bookings.filter(
          (b: any) =>
            ["CHECKED_OUT", "CHECKED_IN"].includes(b.status) && !b.hasReview,
        );
      },
    });

  const hasReviews = reviews.length > 0;
  const canWriteNew = reviewableBookings.length > 0;

  const createMut = useMutation({
    mutationFn: (data: unknown) => reviewService.create(data),
    onSuccess: () => {
      toast.success("Review submitted");
      qc.invalidateQueries({ queryKey: ["my-reviews"] });
      qc.invalidateQueries({ queryKey: ["my-bookings-reviewable"] });
      setShowForm(false);
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to submit review"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      reviewService.update(id, data),
    onSuccess: (res) => {
      const updated = res.data?.data ?? res.data;
      toast.success("Review updated");
      qc.setQueryData(["my-reviews"], (old: Review[] = []) =>
        old.map((r) => (r.id === updated.id ? updated : r)),
      );
      setEditingReview(null);
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to update review"),
  });

  const handleUpdated = (updated: Review) => {
    qc.setQueryData(["my-reviews"], (old: Review[] = []) =>
      old.map((r) => (r.id === updated.id ? updated : r)),
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white font-display font-semibold">
            My Reviews
          </h1>
          <p className="text-white/40 text-sm font-sans mt-0.5">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Write Review button — শুধু reviewable booking থাকলে দেখাবে */}
        {canWriteNew && !showForm && !editingReview && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#37EFD1] hover:bg-[#00FFD5] text-[#0B0C10] px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          >
            <Plus className="h-4 w-4" /> Write Review
          </button>
        )}
      </div>

      {/* Existing reviews action row */}
      {hasReviews && !showForm && !editingReview && (
        <div className="flex items-center gap-2 flex-wrap">
          {reviews.map((review) => (
            <button
              key={review.id}
              onClick={() => setEditingReview(review)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-xs font-sans transition-all"
            >
              <Pencil size={12} />
              Edit:{" "}
              {review.booking?.bookingNumber
                ? `Booking #${review.booking.bookingNumber}`
                : new Date(review.createdAt).toLocaleDateString("en-MY", {
                    day: "numeric",
                    month: "short",
                  })}
            </button>
          ))}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <ReviewForm
          reviewableBookings={reviewableBookings}
          bookingsLoading={bookingsLoading}
          onSubmit={async (data) => createMut.mutateAsync(data)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit Form */}
      {editingReview && (
        <div className="bg-[#1A1B21] border border-[#37EFD1]/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-display font-semibold">
              Edit Review
            </h2>
            <button
              onClick={() => setEditingReview(null)}
              className="text-white/40 hover:text-white text-xs font-sans transition-all"
            >
              Cancel
            </button>
          </div>
          <ReviewCard
            review={editingReview}
            onUpdated={(updated) => {
              handleUpdated(updated);
              setEditingReview(null);
            }}
            defaultEditing
          />
        </div>
      )}

      {/* List */}
      {reviews.length === 0 ? (
        <div className="bg-[#1A1B21] border border-white/8 rounded-2xl p-12 text-center">
          <MessageSquare className="h-8 w-8 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 font-sans text-sm">
            No reviews yet. Share your experience!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) =>
            !editingReview || editingReview.id !== review.id ? (
              <ReviewCard
                key={review.id}
                review={review}
                onUpdated={handleUpdated}
              />
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
