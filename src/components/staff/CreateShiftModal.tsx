"use client";
import { useState } from "react";
import { Loader2, Plus, X, Clock } from "lucide-react";
import DatePicker from "./DatePicker";
import TimePicker from "./TimePicker";

const SHIFT_TYPES = ["MORNING", "AFTERNOON", "EVENING", "NIGHT", "FLEXIBLE"] as const;

interface CreateShiftModalProps {
  onClose: () => void;
  onCreate: (data: ShiftFormData) => Promise<void>;
}

interface ShiftFormData {
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
}

export default function CreateShiftModal({ onClose, onCreate }: CreateShiftModalProps) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ShiftFormData>({
    type: "MORNING",
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  const calcDuration = () => {
    if (!form.startTime || !form.endTime) return null;
    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) mins += 24 * 60;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h} hrs`;
  };

  const duration = calcDuration();

  const handleCreate = async () => {
    setError("");
    if (!form.date) { setError("Date is required"); return; }
    if (!form.startTime || !form.endTime) { setError("Start and end time are required"); return; }
    setCreating(true);
    try {
      await onCreate(form);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to create shift");
    }
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-4">
      <div className="bg-[#1A1B21] border border-white/8 rounded-[18px] w-full max-w-[520px] shadow-2xl">

        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-white text-[15px] font-semibold tracking-tight">New Shift</h3>
            <p className="text-white/35 text-xs mt-1">Fill in the shift details below</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/5 border-none rounded-lg w-[30px] h-[30px] flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-[18px]">
          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Shift Type */}
          <div>
            <label className="text-white/35 text-[11px] uppercase tracking-widest block mb-2">
              Shift Type
            </label>
            <div className="flex flex-wrap gap-2">
              {SHIFT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                    form.type === t
                      ? "bg-[#C8102E]/15 border-[#C8102E]/40 text-[#C8102E]"
                      : "bg-white/4 border-white/8 text-white/40 hover:text-white/60 hover:border-white/15"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Date — custom picker */}
          <div>
            <label className="text-white/35 text-[11px] uppercase tracking-widest block mb-2">
              Date
            </label>
            <DatePicker
              value={form.date}
              onChange={(val) => setForm((f) => ({ ...f, date: val }))}
            />
          </div>

          {/* Start / End Time */}
          <div className="grid grid-cols-2 gap-3">
  <div>
    <label className="text-white/35 text-[11px] uppercase tracking-widest block mb-2">
      Start Time
    </label>
    <TimePicker
      value={form.startTime}
      onChange={(val) => setForm((f) => ({ ...f, startTime: val }))}
      placeholder="Start time"
    />
  </div>
  <div>
    <label className="text-white/35 text-[11px] uppercase tracking-widest block mb-2">
      End Time
    </label>
    <TimePicker
      value={form.endTime}
      onChange={(val) => setForm((f) => ({ ...f, endTime: val }))}
      placeholder="End time"
    />
  </div>
</div>

          {/* Duration */}
          {duration && (
            <div className="flex items-center gap-2 bg-[#37EFD1]/6 border border-[#37EFD1]/15 rounded-[10px] px-3.5 py-2.5">
              <Clock className="h-3.5 w-3.5 text-[#37EFD1]" />
              <span className="text-white/50 text-xs">Duration</span>
              <span className="text-[#37EFD1] text-sm font-semibold ml-auto">{duration}</span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-white/35 text-[11px] uppercase tracking-widest block mb-2">
              Notes{" "}
              <span className="text-white/18 normal-case tracking-normal text-[11px]">(optional)</span>
            </label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Any notes..."
              className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm px-3 py-2.5 rounded-[10px] outline-none placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end px-6 pb-5">
          <button
            onClick={onClose}
            disabled={creating}
            className="px-4 py-2 text-sm text-white/45 border border-white/10 hover:border-white/20 hover:text-white rounded-[10px] transition-all disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-5 py-2 text-sm font-semibold bg-[#C8102E] hover:bg-[#a00d24] text-white rounded-[10px] disabled:opacity-60 flex items-center gap-1.5 transition-all"
          >
            {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Create Shift
          </button>
        </div>
      </div>
    </div>
  );
}