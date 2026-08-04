// components/maintenance/MaintenanceTicketPanel.tsx
'use client';
import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { maintenanceService } from '@/service/maintenance.service';
import { staffService } from '@/service/staff.service';
import { MaintenanceLog, StaffOption } from '@/types';
import { userService } from '@/service/user.service';

type Mode = 'create' | 'view';

interface Props {
  open: boolean;
  mode: Mode;
  ticketId?: string | null;
  roomId?: string;
  onClose: () => void;
  onSaved: () => void;
}

const TYPES = ['ELECTRICAL', 'PLUMBING', 'HVAC', 'FURNITURE', 'CLEANING', 'OTHER'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function MaintenanceTicketPanel({ open, mode, ticketId, roomId, onClose, onSaved }: Props) {
  const [ticket, setTicket] = useState<MaintenanceLog | null>(null);
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '', description: '', type: 'OTHER', priority: 'MEDIUM',
    roomId: roomId || '', location: '', scheduledAt: '',
  });
  const [assignForm, setAssignForm] = useState({ assignedToId: '', scheduledAt: '' });
  const [completeForm, setCompleteForm] = useState({ actualHours: '', cost: '', notes: '' });
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    if (mode === 'view' && ticketId) {
      loadTicket(ticketId);
    } else {
      setTicket(null);
      setForm({ title: '', description: '', type: 'OTHER', priority: 'MEDIUM', roomId: roomId || '', location: '', scheduledAt: '' });
    }
    loadStaff();
  }, [open, mode, ticketId]);

  const loadTicket = async (id: string) => {
    setLoading(true);
    try {
      const res = await maintenanceService.getById(id);
      const t = res.data?.data ?? res.data;
      setTicket(t);
      setAssignForm({ assignedToId: t?.assignedTo ? '' : '', scheduledAt: t?.scheduledAt?.slice(0, 16) || '' });
    } catch {
      setError('Failed to load ticket');
    }
    setLoading(false);
  };

  const loadStaff = async () => {
    try {
      const res = await userService.getAll({ role: 'MAINTENANCE,STAFF,MANAGER,ADMIN' });
      const list = res.data?.data?.data || res.data?.data || [];
      setStaff(list);
    } catch {
      setStaff([]);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await maintenanceService.createTicket({
        ...form,
        roomId: form.roomId || undefined,
        location: form.location || undefined,
        scheduledAt: form.scheduledAt || undefined,
      });
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create ticket');
    }
    setSaving(false);
  };

  const handleAssign = async () => {
    if (!ticket || !assignForm.assignedToId) {
      setError('Select a staff member to assign');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await maintenanceService.assign(
        ticket.id,
        assignForm.assignedToId,
        assignForm.scheduledAt || undefined
      );
      onSaved();
      await loadTicket(ticket.id);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to assign ticket');
    }
    setSaving(false);
  };

  const handleComplete = async () => {
    if (!ticket || !completeForm.actualHours) {
      setError('Actual hours is required to complete a ticket');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await maintenanceService.complete(ticket.id, {
        actualHours: Number(completeForm.actualHours),
        cost: completeForm.cost ? Number(completeForm.cost) : undefined,
        notes: completeForm.notes || undefined,
      });
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to complete ticket');
    }
    setSaving(false);
  };

  const handleCancel = async () => {
    if (!ticket) return;
    setSaving(true);
    setError('');
    try {
      await maintenanceService.cancel(ticket.id, cancelReason || undefined);
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to cancel ticket');
    }
    setSaving(false);
  };

  if (!open) return null;

  const canAct = ticket && !['COMPLETED', 'CANCELLED'].includes(ticket.status);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-[#1A1B21] border-l border-white/10 overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#1A1B21] z-10">
          <h2 className="font-display text-lg text-white font-semibold">
            {mode === 'create' ? 'New Maintenance Ticket' : ticket?.ticketNumber || 'Ticket Details'}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {error && (
            <div className="bg-[#C8102E]/10 border border-[#C8102E]/30 text-[#C8102E] text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-white/30" />
            </div>
          ) : mode === 'create' ? (
            <div className="space-y-4">
              <Field label="Title">
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="input" placeholder="e.g. AC not cooling" />
              </Field>
              <Field label="Description">
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="input min-h-[80px]" placeholder="Describe the issue" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Type">
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="input">
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Priority">
                  <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className="input">
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Room ID (optional)">
                <input value={form.roomId} onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))}
                  className="input" placeholder="Leave blank if not room-specific" />
              </Field>
              <Field label="Location (if no room)">
                <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className="input" placeholder="e.g. Lobby, 3rd floor hallway" />
              </Field>
              <Field label="Scheduled At (optional)">
                <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  className="input" />
              </Field>
              <button onClick={handleCreate} disabled={saving}
                className="w-full bg-[#37EFD1] text-[#0B0C10] font-medium rounded-lg py-2.5 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Ticket
              </button>
            </div>
          ) : ticket ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#37EFD1]/15 text-[#37EFD1]">{ticket.status}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">{ticket.priority}</span>
                  <span className="text-xs text-white/40">{ticket.type}</span>
                </div>
                <h3 className="text-white font-medium">{ticket.title}</h3>
                <p className="text-white/50 text-sm">{ticket.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Location" value={ticket.room?.roomNumber ? `Room #${ticket.room.roomNumber}` : ticket.location || '—'} />
                <Info label="Reported By" value={ticket.reportedBy ? `${ticket.reportedBy.firstName} ${ticket.reportedBy.lastName}` : '—'} />
                <Info label="Assigned To" value={ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : 'Unassigned'} />
                <Info label="Reported" value={new Date(ticket.createdAt).toLocaleString()} />
                {ticket.cost != null && <Info label="Cost" value={`$${ticket.cost}`} />}
                {ticket.actualHours != null && <Info label="Hours Spent" value={String(ticket.actualHours)} />}
              </div>

              {ticket.parts && ticket.parts.length > 0 && (
                <div>
                  <p className="text-white/35 text-[10px] uppercase tracking-widest mb-2">Parts Used</p>
                  <div className="space-y-1">
                    {ticket.parts.map((p) => (
                      <div key={p.id} className="flex justify-between text-xs text-white/60 bg-white/5 rounded px-2 py-1.5">
                        <span>{p.partName} x{p.quantity}</span>
                        <span>${p.totalCost}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {canAct && (
                <div className="space-y-4 border-t border-white/5 pt-4">
                  {!ticket.assignedTo && (
                    <div className="space-y-2">
                      <p className="text-white/35 text-[10px] uppercase tracking-widest">Assign Ticket</p>
                      <select value={assignForm.assignedToId} onChange={(e) => setAssignForm((f) => ({ ...f, assignedToId: e.target.value }))} className="input">
                        <option value="">Select staff member</option>
                        {staff.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.role})</option>)}
                      </select>
                      <button onClick={handleAssign} disabled={saving}
                        className="w-full bg-white/10 text-white text-sm rounded-lg py-2 hover:bg-white/15 transition-colors disabled:opacity-50">
                        Assign
                      </button>
                    </div>
                  )}

                  {ticket.status === 'IN_PROGRESS' && (
                    <div className="space-y-2">
                      <p className="text-white/35 text-[10px] uppercase tracking-widest">Complete Ticket</p>
                      <input type="number" placeholder="Actual hours" value={completeForm.actualHours}
                        onChange={(e) => setCompleteForm((f) => ({ ...f, actualHours: e.target.value }))} className="input" />
                      <input type="number" placeholder="Cost (optional)" value={completeForm.cost}
                        onChange={(e) => setCompleteForm((f) => ({ ...f, cost: e.target.value }))} className="input" />
                      <textarea placeholder="Notes (optional)" value={completeForm.notes}
                        onChange={(e) => setCompleteForm((f) => ({ ...f, notes: e.target.value }))} className="input" />
                      <button onClick={handleComplete} disabled={saving}
                        className="w-full bg-[#37EFD1] text-[#0B0C10] font-medium rounded-lg py-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                        Mark Complete
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    {!showCancelInput ? (
                      <button onClick={() => setShowCancelInput(true)} className="text-[#C8102E] text-xs hover:underline">
                        Cancel this ticket
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <input placeholder="Cancellation reason (optional)" value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)} className="input" />
                        <div className="flex gap-2">
                          <button onClick={handleCancel} disabled={saving}
                            className="flex-1 bg-[#C8102E]/15 text-[#C8102E] text-sm rounded-lg py-2 hover:bg-[#C8102E]/25 transition-colors disabled:opacity-50">
                            Confirm Cancel
                          </button>
                          <button onClick={() => setShowCancelInput(false)} className="flex-1 bg-white/5 text-white/60 text-sm rounded-lg py-2">
                            Back
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          background: #0B0C10;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.5rem;
          padding: 0.6rem 0.75rem;
          color: white;
          font-size: 0.875rem;
        }
        .input:focus { outline: none; border-color: #37EFD1; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-white/40 text-xs">{label}</label>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-white/70">{value}</p>
    </div>
  );
}