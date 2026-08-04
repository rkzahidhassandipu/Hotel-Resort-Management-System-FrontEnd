"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle, XCircle, Flag, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";
import { reviewService } from "@/service/review.service";
import type { Review } from "@/types";
import StarRating from "./shared/StarRating";
import StatusBadge from "./shared/StatusBadge";
import { ReviewStatus, inputCls, fmtDate } from "./shared/reviewTypes";

export default function ReviewDetailModal({ review, onClose }: { review: Review; onClose: () => void }) {
  const qc = useQueryClient();
  const [response, setResponse] = useState(review.managerResponse ?? "");
  const [showResponse, setShowResponse] = useState(false);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["reviews"] });
    qc.invalidateQueries({ queryKey: ["review-stats"] });
  };

  const moderateMut = useMutation({
    mutationFn: (status: string) => reviewService.moderate(review.id, status),
    onSuccess: () => { toast.success("Review moderated"); invalidate(); onClose(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
  });

  const respondMut = useMutation({
    mutationFn: () => reviewService.respond(review.id, response),
    onSuccess: () => { toast.success("Response added"); invalidate(); onClose(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: () => reviewService.delete(review.id),
    onSuccess: () => { toast.success("Review deleted"); invalidate(); onClose(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
  });

  const ratingRows = [
    { label: "Overall",     value: review.overallRating },
    { label: "Cleanliness", value: review.cleanlinessRating },
    { label: "Service",     value: review.serviceRating },
    { label: "Food",        value: review.foodRating },
    { label: "Location",    value: review.locationRating },
    { label: "Value",       value: review.valueRating },
  ].filter(r => r.value != null);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1A1B21] border border-white/8 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={review.status as ReviewStatus} />
              <StarRating rating={review.overallRating} />
            </div>
            <h2 className="text-white font-display text-lg font-semibold">{review.title || "Untitled Review"}</h2>
            <p className="text-white/30 text-xs font-sans mt-0.5">
              {review.isAnonymous ? "Anonymous" : `${(review.user as any)?.firstName ?? ""} ${(review.user as any)?.lastName ?? ""}`}
              {" · "}{fmtDate(review.createdAt)}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>

        {/* Comment */}
        {review.comment && (
          <div className="bg-[#0B0C10] border border-white/5 rounded-lg p-3 mb-4">
            <p className="text-white/70 text-sm font-sans leading-relaxed">{review.comment}</p>
          </div>
        )}

        {/* Ratings */}
        <div className="space-y-2 mb-4">
          {ratingRows.map(r => (
            <div key={r.label} className="flex items-center justify-between">
              <span className="text-white/40 text-xs font-sans">{r.label}</span>
              <StarRating rating={r.value!} />
            </div>
          ))}
        </div>

        {/* Manager response */}
        {review.managerResponse && (
          <div className="bg-[#37EFD1]/5 border border-[#37EFD1]/15 rounded-lg p-3 mb-4">
            <p className="text-[#37EFD1] text-xs font-sans font-medium mb-1">Manager Response</p>
            <p className="text-white/70 text-sm font-sans">{review.managerResponse}</p>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-white/8 pt-4 space-y-3">
          {review.status === "PENDING" && (
            <div className="flex gap-2">
              <button onClick={() => moderateMut.mutate("APPROVED")} disabled={moderateMut.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-sm font-sans transition-all disabled:opacity-60">
                {moderateMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />} Approve
              </button>
              <button onClick={() => moderateMut.mutate("REJECTED")} disabled={moderateMut.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-sans transition-all disabled:opacity-60">
                {moderateMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />} Reject
              </button>
              <button onClick={() => moderateMut.mutate("FLAGGED")} disabled={moderateMut.isPending}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 text-sm font-sans transition-all disabled:opacity-60">
                <Flag size={13} />
              </button>
            </div>
          )}

          {review.status === "APPROVED" && (
            !showResponse ? (
              <button onClick={() => setShowResponse(true)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-sm font-sans transition-all">
                <MessageSquare size={13} />
                {review.managerResponse ? "Edit Response" : "Add Response"}
              </button>
            ) : (
              <div className="space-y-2">
                <textarea value={response} onChange={e => setResponse(e.target.value)} rows={3}
                  placeholder="Write your response…" className={`${inputCls} resize-none`} />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowResponse(false)} className="px-3 py-1.5 text-xs font-sans text-white/50 border border-white/10 rounded-lg hover:text-white transition-all">Cancel</button>
                  <button onClick={() => respondMut.mutate()} disabled={respondMut.isPending || !response.trim()}
                    className="px-3 py-1.5 text-xs font-sans font-medium bg-[#37EFD1] text-[#0B0C10] rounded-lg hover:bg-[#00FFD5] disabled:opacity-60 flex items-center gap-1.5 transition-all">
                    {respondMut.isPending && <Loader2 size={11} className="animate-spin" />}
                    Submit Response
                  </button>
                </div>
              </div>
            )
          )}

          <button onClick={() => { if (confirm("Delete this review?")) deleteMut.mutate(); }} disabled={deleteMut.isPending}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm font-sans transition-all disabled:opacity-60">
            {deleteMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
            Delete Review
          </button>
        </div>
      </div>
    </div>
  );
}