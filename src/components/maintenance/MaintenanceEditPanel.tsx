"use client";
import { useState } from "react";
import {
  X,
  Save,
  UserCheck,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { maintenanceService } from "@/service/maintenance.service";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  description?: string;
  notes?: string;
  scheduledAt?: string;
  assignedTo?: { firstName: string; lastName: string };
}

interface Props {
  ticket: MaintenanceTicket;
  onClose: () => void;
  onSuccess: () => void;
}

type ActionTab = "update" | "assign" | "complete" | "cancel";

const TYPES = [
  "PLUMBING",
  "ELECTRICAL",
  "HVAC",
  "FURNITURE",
  "APPLIANCE",
  "STRUCTURAL",
  "OTHER",
];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"];
const STATUSES = ["PENDING", "IN_PROGRESS", "ON_HOLD"];

export default function MaintenanceEditPanel({
  ticket,
  onClose,
  onSuccess,
}: Props) {
  const [activeTab, setActiveTab] = useState<ActionTab>("update");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useCurrentUser();
  const isManager = user?.role === "MANAGER";

  // Update form
  const [updateForm, setUpdateForm] = useState({
    title: ticket.title || "",
    type: ticket.type || "",
    priority: ticket.priority || "MEDIUM",
    status: ticket.status || "PENDING",
    description: ticket.description || "",
    notes: ticket.notes || "",
    scheduledAt: ticket.scheduledAt ? ticket.scheduledAt.slice(0, 16) : "",
  });

  // Assign form
  const [assignForm, setAssignForm] = useState({
    assignedToId: "",
    scheduledAt: "",
  });

  // Complete form
  const [completeForm, setCompleteForm] = useState({
    actualHours: "",
    cost: "",
    notes: "",
    parts: [] as {
      partName: string;
      quantity: string;
      unitCost: string;
      totalCost: string;
    }[],
  });

  // Cancel
  const [cancelReason, setCancelReason] = useState("");

  const isCompleted = ticket.status === "COMPLETED";
  const isCancelled = ticket.status === "CANCELLED";
  const isLocked = isCompleted || isCancelled;

  const run = async (fn: () => Promise<any>) => {
    setLoading(true);
    setError("");
    try {
      await fn();
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    if (!updateForm.title.trim()) {
      setError("Title is required");
      return;
    }
    run(() =>
      maintenanceService.update(ticket.id, {
        ...updateForm,
        scheduledAt: updateForm.scheduledAt || undefined,
      }),
    );
  };

  const handleAssign = () => {
    if (!assignForm.assignedToId.trim()) {
      setError("User ID is required");
      return;
    }
    run(() =>
      maintenanceService.assign(
        ticket.id,
        assignForm.assignedToId,
        assignForm.scheduledAt || undefined,
      ),
    );
  };

  const handleComplete = () => {
    const hours = parseFloat(completeForm.actualHours);
    if (!completeForm.actualHours.trim() || Number.isNaN(hours) || hours < 0) {
      setError("Actual hours is required and must be a valid number");
      return;
    }

    // Validate any parts the user started filling in — partial rows
    // (e.g. name set but cost blank) would otherwise send NaN to the API.
    for (const p of completeForm.parts) {
      if (!p.partName.trim()) continue; // skip fully-empty rows, filtered out below
      const qty = parseInt(p.quantity, 10);
      const unitCost = parseFloat(p.unitCost);
      const totalCost = parseFloat(p.totalCost);
      if (Number.isNaN(qty) || qty <= 0) {
        setError(`"${p.partName}": quantity must be a positive number`);
        return;
      }
      if (Number.isNaN(unitCost) || unitCost < 0) {
        setError(`"${p.partName}": unit cost must be a valid number`);
        return;
      }
      if (Number.isNaN(totalCost) || totalCost < 0) {
        setError(`"${p.partName}": total cost must be a valid number`);
        return;
      }
    }

    const cost = completeForm.cost.trim()
      ? parseFloat(completeForm.cost)
      : undefined;
    if (cost !== undefined && Number.isNaN(cost)) {
      setError("Total cost must be a valid number");
      return;
    }

    run(() =>
      maintenanceService.complete(ticket.id, {
        actualHours: hours,
        cost,
        notes: completeForm.notes || undefined,
        parts: completeForm.parts
          .filter((p) => p.partName.trim())
          .map((p) => ({
            partName: p.partName,
            quantity: parseInt(p.quantity, 10),
            unitCost: parseFloat(p.unitCost),
            totalCost: parseFloat(p.totalCost),
          })),
      }),
    );
  };

  const handleCancel = () =>
    run(() => maintenanceService.cancel(ticket.id, cancelReason || undefined));

  const addPart = () =>
    setCompleteForm((f) => ({
      ...f,
      parts: [
        ...f.parts,
        { partName: "", quantity: "1", unitCost: "", totalCost: "" },
      ],
    }));
  const removePart = (i: number) =>
    setCompleteForm((f) => ({
      ...f,
      parts: f.parts.filter((_, idx) => idx !== i),
    }));
  const updatePart = (i: number, key: string, val: string) =>
    setCompleteForm((f) => ({
      ...f,
      parts: f.parts.map((p, idx) => (idx === i ? { ...p, [key]: val } : p)),
    }));

  type Tab = {
  key: ActionTab;
  label: string;
  icon: any;
  disabled?: boolean;
};

const tabs: Tab[] = [
  { key: "update", label: "Update", icon: Save, disabled: isLocked },
  { key: "assign", label: "Assign", icon: UserCheck, disabled: isLocked },
  {
    key: "complete",
    label: "Complete",
    icon: CheckCircle,
    disabled: isCompleted || isCancelled,
  },
  {
    key: "cancel",
    label: "Cancel",
    icon: XCircle,
    disabled: isCompleted || isCancelled,
  },
].filter((tab) => !(isManager && tab.key === "complete")) as Tab[];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-lg bg-[#13141A] border-l border-white/10 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10 shrink-0">
          <div>
            <span className="text-[#37EFD1] font-mono text-xs">
              {ticket.ticketNumber}
            </span>
            <h2 className="text-white font-semibold text-base mt-0.5 leading-tight">
              {ticket.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Tabs */}
        <div className="flex gap-1 px-6 pt-4 shrink-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                if (!t.disabled) {
                  setActiveTab(t.key);
                  setError("");
                }
              }}
              disabled={t.disabled}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === t.key
                  ? "bg-[#37EFD1]/20 text-[#37EFD1] border border-[#37EFD1]/30"
                  : t.disabled
                    ? "text-white/20 cursor-not-allowed"
                    : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Locked notice */}
        {isLocked && (
          <div className="mx-6 mt-4 bg-white/5 border border-white/10 text-white/50 text-xs rounded-lg px-4 py-2.5">
            This ticket is {ticket.status.toLowerCase()} and can no longer be
            modified.
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* UPDATE */}
          {activeTab === "update" && (
            <>
              <Field label="Title">
                <input
                  value={updateForm.title}
                  onChange={(e) =>
                    setUpdateForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className={inputCls}
                  placeholder="Ticket title"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Type">
                  <select
                    value={updateForm.type}
                    onChange={(e) =>
                      setUpdateForm((f) => ({ ...f, type: e.target.value }))
                    }
                    className={inputCls}
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Priority">
                  <select
                    value={updateForm.priority}
                    onChange={(e) =>
                      setUpdateForm((f) => ({ ...f, priority: e.target.value }))
                    }
                    className={inputCls}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Status">
                <select
                  value={updateForm.status}
                  onChange={(e) =>
                    setUpdateForm((f) => ({ ...f, status: e.target.value }))
                  }
                  className={inputCls}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Description">
                <textarea
                  value={updateForm.description}
                  onChange={(e) =>
                    setUpdateForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  className={`${inputCls} min-h-[80px] resize-none`}
                  placeholder="Describe the issue..."
                />
              </Field>
              <Field label="Notes">
                <textarea
                  value={updateForm.notes}
                  onChange={(e) =>
                    setUpdateForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  className={`${inputCls} min-h-[60px] resize-none`}
                  placeholder="Additional notes..."
                />
              </Field>
              <Field label="Scheduled At">
                <input
                  type="datetime-local"
                  value={updateForm.scheduledAt}
                  onChange={(e) =>
                    setUpdateForm((f) => ({
                      ...f,
                      scheduledAt: e.target.value,
                    }))
                  }
                  className={inputCls}
                />
              </Field>
            </>
          )}

          {/* ASSIGN */}
          {activeTab === "assign" && (
            <>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-xs text-blue-300">
                Currently assigned to:{" "}
                <span className="font-medium text-white">
                  {ticket.assignedTo
                    ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
                    : "Nobody"}
                </span>
              </div>
              <Field label="Staff User ID">
                <input
                  value={assignForm.assignedToId}
                  onChange={(e) =>
                    setAssignForm((f) => ({
                      ...f,
                      assignedToId: e.target.value,
                    }))
                  }
                  className={inputCls}
                  placeholder="User ID to assign"
                />
              </Field>
              <Field label="Schedule At (optional)">
                <input
                  type="datetime-local"
                  value={assignForm.scheduledAt}
                  onChange={(e) =>
                    setAssignForm((f) => ({
                      ...f,
                      scheduledAt: e.target.value,
                    }))
                  }
                  className={inputCls}
                />
              </Field>
            </>
          )}

          {/* COMPLETE */}
          {activeTab === "complete" && !isManager && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Actual Hours *">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={completeForm.actualHours}
                    onChange={(e) =>
                      setCompleteForm((f) => ({
                        ...f,
                        actualHours: e.target.value,
                      }))
                    }
                    className={inputCls}
                    placeholder="e.g. 2.5"
                  />
                </Field>
                <Field label="Total Cost ($)">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={completeForm.cost}
                    onChange={(e) =>
                      setCompleteForm((f) => ({ ...f, cost: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="0.00"
                  />
                </Field>
              </div>
              <Field label="Completion Notes">
                <textarea
                  value={completeForm.notes}
                  onChange={(e) =>
                    setCompleteForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  className={`${inputCls} min-h-[70px] resize-none`}
                  placeholder="Work done summary..."
                />
              </Field>

              {/* Parts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-white/40 uppercase tracking-wider">
                    Parts Used
                  </p>
                  <button
                    onClick={addPart}
                    className="flex items-center gap-1 text-[#37EFD1] text-xs hover:underline"
                  >
                    <Plus size={12} /> Add Part
                  </button>
                </div>
                {completeForm.parts.map((p, i) => (
                  <div
                    key={i}
                    className="bg-white/5 rounded-lg p-3 mb-2 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        value={p.partName}
                        onChange={(e) =>
                          updatePart(i, "partName", e.target.value)
                        }
                        className={`${inputCls} flex-1`}
                        placeholder="Part name"
                      />
                      <button
                        onClick={() => removePart(i)}
                        className="text-red-400/60 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        min="1"
                        value={p.quantity}
                        onChange={(e) =>
                          updatePart(i, "quantity", e.target.value)
                        }
                        className={inputCls}
                        placeholder="Qty"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={p.unitCost}
                        onChange={(e) =>
                          updatePart(i, "unitCost", e.target.value)
                        }
                        className={inputCls}
                        placeholder="Unit $"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={p.totalCost}
                        onChange={(e) =>
                          updatePart(i, "totalCost", e.target.value)
                        }
                        className={inputCls}
                        placeholder="Total $"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* CANCEL */}
          {activeTab === "cancel" && (
            <>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-xs text-red-300">
                This action cannot be undone. The ticket will be marked as
                cancelled and the room status will be updated.
              </div>
              <Field label="Reason (optional)">
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className={`${inputCls} min-h-[80px] resize-none`}
                  placeholder="Why is this ticket being cancelled?"
                />
              </Field>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 shrink-0">
          {activeTab === "update" && (
            <ActionBtn
              loading={loading}
              onClick={handleUpdate}
              color="#37EFD1"
              label="Save Changes"
            />
          )}
          {activeTab === "assign" && (
            <ActionBtn
              loading={loading}
              onClick={handleAssign}
              color="#60a5fa"
              label="Assign Ticket"
            />
          )}
          {activeTab === "complete" && !isManager && (
            <ActionBtn
              loading={loading}
              onClick={handleComplete}
              color="#a78bfa"
              label="Mark as Completed"
            />
          )}
          {activeTab === "cancel" && (
            <ActionBtn
              loading={loading}
              onClick={handleCancel}
              color="#f87171"
              label="Cancel Ticket"
            />
          )}
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ActionBtn({
  loading,
  onClick,
  color,
  label,
}: {
  loading: boolean;
  onClick: () => void;
  color: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        backgroundColor: `${color}20`,
        borderColor: `${color}40`,
        color,
      }}
      className="w-full py-2.5 rounded-xl border font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50"
    >
      {loading ? "Processing..." : label}
    </button>
  );
}

const inputCls =
  "w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-[#37EFD1]/50 focus:bg-white/8 transition-colors placeholder:text-white/20";
