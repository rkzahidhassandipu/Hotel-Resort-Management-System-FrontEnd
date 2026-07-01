"use client";
import { useState } from "react";
import { Loader2, CheckCheck, Star } from "lucide-react";

interface Props {
  task: { taskId: string; title: string; assigneeName: string };
  submitting: boolean;
  onConfirm: (rating: number, note: string) => void;
  onClose: () => void;
}

const RATING_LABELS: Record<number, string> = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Great", 5: "Excellent" };

export default function CompleteReviewModal({ task, submitting, onConfirm, onClose }: Props) {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState<number | null>(null);
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#1A1B21] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCheck className="h-4 w-4 text-green-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-display text-base font-semibold">Mark Task Complete</h3>
            <p className="text-white/40 text-xs mt-0.5 truncate">{task.title}</p>
            <p className="text-white/25 text-xs">Assigned to {task.assigneeName}</p>
          </div>
        </div>
        <div className="h-px bg-white/5" />
        <div>
          <label className="text-white/50 text-xs mb-3 block font-sans">Rate performance on this task</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} onClick={() => setRating(i)} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                className="focus:outline-none transition-transform hover:scale-110">
                <Star className={`h-7 w-7 transition-colors ${i <= (hovered ?? rating) ? "text-yellow-400 fill-yellow-400" : "text-white/15"}`} />
              </button>
            ))}
            <span className="text-white/40 text-xs ml-1 font-sans">{RATING_LABELS[hovered ?? rating]}</span>
          </div>
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block font-sans">Review note <span className="text-white/25">(optional)</span></label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="How did they perform on this task?" rows={3}
            className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm px-3 py-2.5 rounded-lg outline-none placeholder:text-white/20 resize-none focus:border-white/20 transition-colors font-sans" />
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} disabled={submitting}
            className="px-4 py-2 text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all disabled:opacity-40">
            Cancel
          </button>
          <button onClick={() => onConfirm(rating, note)} disabled={submitting}
            className="px-5 py-2 text-sm bg-green-600 hover:bg-green-500 text-white rounded-lg disabled:opacity-60 flex items-center gap-2 transition-all font-sans">
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
            Complete & Save Review
          </button>
        </div>
      </div>
    </div>
  );
}