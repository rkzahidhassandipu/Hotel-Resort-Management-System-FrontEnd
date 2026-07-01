"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Plus, Loader2 } from "lucide-react";
import { serviceRequestService } from "@/service/service-request.service";
import { SRType, SR_TYPES, SRPriority, inputCls, selectCls } from "@/types/servicesTypes";

export default function CreateRequestModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    type: "ROOM_SERVICE" as SRType,
    priority: "MEDIUM" as SRPriority,
    description: "",
    bookingId: "",
    scheduledAt: "",
  });

  const mut = useMutation({
    mutationFn: () => serviceRequestService.create({
      type: form.type,
      priority: form.priority,
      description: form.description || undefined,
      bookingId: form.bookingId || undefined,
      scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-requests"] });
      qc.invalidateQueries({ queryKey: ["sr-stats"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1A1B21] border border-white/8 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-display text-lg font-semibold">New Service Request</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <X size={14} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs font-sans mb-1.5 block">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as SRType }))} className={selectCls}>
                {SR_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs font-sans mb-1.5 block">Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as SRPriority }))} className={selectCls}>
                {(["LOW", "MEDIUM", "HIGH", "URGENT"] as SRPriority[]).map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-white/40 text-xs font-sans mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} placeholder="Describe the request…"
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs font-sans mb-1.5 block">Booking ID <span className="text-white/20">(optional)</span></label>
              <input value={form.bookingId} onChange={e => setForm(p => ({ ...p, bookingId: e.target.value }))} className={inputCls} placeholder="booking id…" />
            </div>
            <div>
              <label className="text-white/40 text-xs font-sans mb-1.5 block">Scheduled At <span className="text-white/20">(optional)</span></label>
              <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-sans text-white/50 hover:text-white border border-white/10 rounded-lg transition-all">Cancel</button>
          <button onClick={() => mut.mutate()} disabled={mut.isPending}
            className="px-4 py-2 text-sm font-sans font-medium bg-[#37EFD1] text-[#0B0C10] rounded-lg hover:bg-[#00FFD5] disabled:opacity-60 flex items-center gap-2 transition-all">
            {mut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {mut.isPending ? "Creating…" : "Create Request"}
          </button>
        </div>
      </div>
    </div>
  );
}