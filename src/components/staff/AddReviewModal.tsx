"use client";
import { useState } from "react";
import { Loader2, Star, X } from "lucide-react";
import { staffService } from "@/service/staff.service";
import { StaffProfile } from "@/types";
import StarPicker from "./StarPicker";

interface AddReviewModalProps {
  staffList: StaffProfile[];
  selectedProfile: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function AddReviewModal({
  staffList,
  selectedProfile,
  onSuccess,
  onClose,
}: AddReviewModalProps) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    period: "",
    rating: 3,
    punctuality: 3,
    productivity: 3,
    attitude: 3,
    teamwork: 3,
    comments: "",
    goals: "",
  });

  const handleCreate = async () => {
    setError("");
    const profile = staffList.find((s) => s.id === selectedProfile);
    const profileId = profile?.staffProfile?.id;
    if (!profileId) { setError("Select a staff member first"); return; }
    if (!form.period.trim()) { setError("Period is required (e.g. Q2 2026)"); return; }

    setCreating(true);
    try {
      await staffService.addPerformanceReview(profileId, {
        period: form.period,
        rating: form.rating,
        punctuality: form.punctuality,
        productivity: form.productivity,
        attitude: form.attitude,
        teamwork: form.teamwork,
        ...(form.comments && { comments: form.comments }),
        ...(form.goals && { goals: form.goals }),
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to submit review");
    }
    setCreating(false);
  };

  const selectedStaff = staffList.find((s) => s.id === selectedProfile);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#1A1B21] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h3 className="text-white font-display text-base font-semibold">
              New Performance Review
            </h3>
            {selectedStaff && (
              <p className="text-white/40 text-xs mt-0.5">
                {selectedStaff.firstName} {selectedStaff.lastName} ·{" "}
                {selectedStaff.staffProfile?.department}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Period */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">
              Review Period *
            </label>
            <input
              type="text"
              value={form.period}
              onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
              placeholder="e.g. Q2 2026 or June 2026"
              className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm px-3 py-2.5 rounded-lg outline-none placeholder:text-white/20 focus:border-white/20 transition-colors"
            />
          </div>

          {/* Ratings */}
          <div className="space-y-1">
            <p className="text-white/40 text-xs mb-3">Ratings (1–5)</p>
            <div className="bg-[#0B0C10] border border-white/5 rounded-xl p-4 space-y-4">
              <StarPicker
                label="Overall"
                value={form.rating}
                onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
              />
              <div className="h-px bg-white/5" />
              <StarPicker
                label="Punctuality"
                value={form.punctuality}
                onChange={(v) => setForm((f) => ({ ...f, punctuality: v }))}
              />
              <StarPicker
                label="Productivity"
                value={form.productivity}
                onChange={(v) => setForm((f) => ({ ...f, productivity: v }))}
              />
              <StarPicker
                label="Attitude"
                value={form.attitude}
                onChange={(v) => setForm((f) => ({ ...f, attitude: v }))}
              />
              <StarPicker
                label="Teamwork"
                value={form.teamwork}
                onChange={(v) => setForm((f) => ({ ...f, teamwork: v }))}
              />
            </div>
          </div>

          {/* Comments & Goals */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">
                Comments <span className="text-white/20">(optional)</span>
              </label>
              <textarea
                value={form.comments}
                onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
                placeholder="General feedback and observations..."
                rows={2}
                className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm px-3 py-2.5 rounded-lg outline-none placeholder:text-white/20 resize-none focus:border-white/20 transition-colors"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">
                Goals for Next Period <span className="text-white/20">(optional)</span>
              </label>
              <textarea
                value={form.goals}
                onChange={(e) => setForm((f) => ({ ...f, goals: e.target.value }))}
                placeholder="Targets and expectations..."
                rows={2}
                className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm px-3 py-2.5 rounded-lg outline-none placeholder:text-white/20 resize-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 justify-end p-6 pt-0">
          <button
            onClick={onClose}
            disabled={creating}
            className="px-4 py-2 text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-5 py-2 text-sm bg-[#C8102E] hover:bg-[#a00d24] text-white rounded-lg disabled:opacity-60 flex items-center gap-2 transition-all"
          >
            {creating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Star className="h-3.5 w-3.5" />
            )}
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}