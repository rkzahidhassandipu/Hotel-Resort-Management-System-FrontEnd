"use client";
import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { staffService } from "@/service/staff.service";
import { StaffProfile } from "./staff.helpers";
import DatePicker from "./DatePicker";

interface CreateTaskModalProps {
  staffList: StaffProfile[];
  onSuccess: () => void;
  onClose: () => void;
}

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

const PRIORITY_PILL: Record<string, string> = {
  LOW:    "bg-blue-500/15 border-blue-500/30 text-blue-400",
  MEDIUM: "bg-yellow-500/15 border-yellow-500/30 text-yellow-400",
  HIGH:   "bg-orange-500/15 border-orange-500/30 text-orange-400",
  URGENT: "bg-red-500/15 border-[#C8102E]/40 text-[#C8102E]",
};

export default function CreateTaskModal({
  staffList,
  onSuccess,
  onClose,
}: CreateTaskModalProps) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedToId: "",
    priority: "MEDIUM",
    dueDate: "",
  });

  const handleCreate = async () => {
    setError("");
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.assignedToId) { setError("Please assign to a staff member"); return; }
    setCreating(true);
    try {
      await staffService.createTask({
        title: form.title,
        ...(form.description && { description: form.description }),
        assignedToId: form.assignedToId,
        priority: form.priority,
        ...(form.dueDate && { dueDate: new Date(form.dueDate).toISOString() }),
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to create task");
    }
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-4">
      <div className="bg-[#1A1B21] border border-white/8 rounded-[18px] w-full max-w-[520px] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-white text-[15px] font-semibold tracking-tight">New Task</h3>
            <p className="text-white/35 text-xs mt-1">Fill in the task details below</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/5 rounded-lg w-[30px] h-[30px] flex items-center justify-center text-white/40 hover:text-white transition-colors"
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

          {/* Title */}
          <div>
            <label className="text-white/35 text-[11px] uppercase tracking-widest block mb-2">
              Title <span className="text-[#C8102E]/60">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Clean room 204 before check-in"
              className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm px-3 py-2.5 rounded-[10px] outline-none placeholder:text-white/20 focus:border-white/20 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-white/35 text-[11px] uppercase tracking-widest block mb-2">
              Description{" "}
              <span className="text-white/18 normal-case tracking-normal text-[11px]">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Any additional details..."
              rows={2}
              className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm px-3 py-2.5 rounded-[10px] outline-none placeholder:text-white/20 resize-none focus:border-white/20 transition-colors"
            />
          </div>

          {/* Assign To */}
          <div>
            <label className="text-white/35 text-[11px] uppercase tracking-widest block mb-2">
              Assign To <span className="text-[#C8102E]/60">*</span>
            </label>
            <select
              value={form.assignedToId}
              onChange={(e) => setForm((f) => ({ ...f, assignedToId: e.target.value }))}
              className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm px-3 py-2.5 rounded-[10px] outline-none focus:border-white/20 transition-colors"
            >
              <option value="">Select staff member</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.role})
                </option>
              ))}
            </select>
          </div>

          {/* Priority Pills */}
          <div>
            <label className="text-white/35 text-[11px] uppercase tracking-widest block mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, priority: p }))}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                    form.priority === p
                      ? PRIORITY_PILL[p]
                      : "bg-white/4 border-white/8 text-white/40 hover:text-white/60 hover:border-white/15"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-white/35 text-[11px] uppercase tracking-widest block mb-2">
              Due Date{" "}
              <span className="text-white/18 normal-case tracking-normal text-[11px]">(optional)</span>
            </label>
            <DatePicker
              value={form.dueDate}
              onChange={(val) => setForm((f) => ({ ...f, dueDate: val }))}
              placeholder="Pick a due date"
            />
          </div>
        </div>

        {/* Footer */}
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
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}