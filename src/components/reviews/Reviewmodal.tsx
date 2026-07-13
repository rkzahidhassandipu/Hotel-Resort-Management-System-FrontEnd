"use client";
import { useState, useEffect } from "react";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { reviewService } from "@/service/review.service";
import StarPicker from "@/components/reviews/StarPicker";
import type { Booking } from "@/types";
import { useQuery } from "@tanstack/react-query";

export interface BookingReview {
  id: string;
  bookingId?: string;
  overallRating: number;
  title?: string;
  comment?: string;
  isAnonymous?: boolean;
}

export type BookingWithReview = Booking & {
  hasReview?: boolean;
  reviewId?: string | null;
  reviews?: BookingReview[];
};
interface ReviewModalProps {
  booking: BookingWithReview;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({
  booking,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  // booking list only tells us hasReview (boolean) — not the actual re
  // view payload,
  // so when editing we fetch the real review record here.
  const [existingReview, setExistingReview] = useState<BookingReview | null>(
    booking.reviews?.[0] ?? null,
  );
  const [loadingReview, setLoadingReview] = useState(false);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const hasReview = booking.hasReview === true || !!existingReview;

  useEffect(() => {
    // If we already got the review inline, or there's definitely no review, skip fetching.
    if (existingReview || !booking.hasReview) return;

    let cancelled = false;
    setLoadingReview(true);
    // No direct "review by booking id" endpoint exists, so we pull the user's
    // reviews and match the one that belongs to this booking.
    reviewService
      .getMyReviews()
      .then((res: any) => {
        if (cancelled) return;
        const list: BookingReview[] = res?.data?.data ?? res?.data ?? [];
        const review = list.find(
          (rv: BookingReview) => rv.bookingId === booking.id,
        );
        if (review) {
          setExistingReview(review);
          setRating(review.overallRating ?? 5);
          setTitle(review.title ?? "");
          setComment(review.comment ?? "");
          setAnonymous(review.isAnonymous ?? false);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your existing review.");
      })
      .finally(() => {
        if (!cancelled) setLoadingReview(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.id]);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.overallRating ?? 5);
      setTitle(existingReview.title ?? "");
      setComment(existingReview.comment ?? "");
      setAnonymous(existingReview.isAnonymous ?? false);
    }
  }, [existingReview]);

  const inputCls =
    "w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3 py-2.5 rounded-lg focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20 outline-none";

  const { data: reviewData } = useQuery({
    queryKey: ["review", booking.reviewId],
    queryFn: async () => {
      if (!booking.reviewId) return null;

      const res = await reviewService.getById(booking.reviewId);
      return res.data.data;
    },
    enabled: !!booking.reviewId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (existingReview) {
        await reviewService.update(existingReview.id, {
          overallRating: rating,
          title: title.trim() || undefined,
          comment: comment.trim() || undefined,
          isAnonymous: anonymous,
        });
        toast.success("Review updated!");
      } else {
        await reviewService.create({
          bookingId: booking.id,
          overallRating: rating,
          title: title.trim() || undefined,
          comment: comment.trim() || undefined,
          isAnonymous: anonymous,
        });
        toast.success("Review submitted!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#1A1B21] border border-white/8 rounded-2xl p-6 w-full max-w-md space-y-4 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white font-display font-semibold text-lg">
              {hasReview ? "Edit Your Review" : "Write a Review"}
            </h2>
            <p className="text-white/40 text-xs font-sans mt-0.5">
              Booking #{booking.bookingNumber} · Room{" "}
              {(booking.room as any)?.roomNumber ?? "—"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {loadingReview ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-white/30" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/50 text-xs uppercase tracking-widest font-sans mb-2 block">
                Overall Rating
              </label>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="text-white/50 text-xs uppercase tracking-widest font-sans mb-1 block">
                Title{" "}
                <span className="text-white/25 normal-case">(optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Summarize your experience"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-white/50 text-xs uppercase tracking-widest font-sans mb-1 block">
                Comment{" "}
                <span className="text-white/25 normal-case">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                placeholder="Tell us about your stay..."
                className={`${inputCls} resize-none`}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="accent-[#37EFD1]"
              />
              <span className="text-white/50 text-sm font-sans">
                Post anonymously
              </span>
            </label>
            {error && (
              <p className="text-[#C8102E] text-sm font-sans bg-[#C8102E]/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : existingReview ? (
                  "Update Review"
                ) : (
                  "Submit Review"
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-sm font-sans text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
