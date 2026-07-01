'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { maintenanceService } from '@/service/maintenance.service';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const TYPES = ['REGULAR', 'DEEP_CLEAN', 'TURNOVER', 'INSPECTION'];
const STATUSES = ['PENDING', 'IN_PROGRESS'];

const CHECKLIST_ITEMS = [
  'Beds made', 'Floors vacuumed', 'Bathroom cleaned', 'Trash removed',
  'Towels replaced', 'Toiletries restocked', 'Windows wiped', 'AC/heating checked',
];

export default function CreateHousekeepingModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    roomNumber: '',
    type: 'REGULAR',
    status: 'PENDING',
    notes: '',
    checklist: {} as Record<string, boolean>,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleCheck = (item: string) =>
    setForm(f => ({ ...f, checklist: { ...f.checklist, [item]: !f.checklist[item] } }));

  const handleSubmit = async () => {
    const roomNumber = form.roomNumber.trim();
    if (!roomNumber) { setError('Room number is required'); return; }

    setLoading(true);
    setError('');
    try {
      await maintenanceService.createHousekeepingLog({
        roomNumber,
        type: form.type,
        status: form.status,
        notes: form.notes.trim() || undefined,
        checklist: Object.keys(form.checklist).length ? form.checklist : undefined,
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      // Backend throws NotFoundError("Room {roomNumber} not found") when the
      // typed-in room number doesn't match any room — surfaced here as-is.
      setError(e?.response?.data?.message || e?.message || 'Failed to create log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#13141A] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-white font-semibold">New Housekeeping Log</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <Field label="Room Number *">
            <input value={form.roomNumber} onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))}
              className={inputCls} placeholder="e.g. 204" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inputCls}>
                {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Notes">
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className={`${inputCls} min-h-[60px] resize-none`} placeholder="Additional notes..." />
          </Field>

          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Checklist</p>
            <div className="grid grid-cols-2 gap-2">
              {CHECKLIST_ITEMS.map(item => (
                <label key={item} className="flex items-center gap-2 cursor-pointer group">
                  <div
                    onClick={() => toggleCheck(item)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      form.checklist[item]
                        ? 'bg-[#37EFD1] border-[#37EFD1]'
                        : 'border-white/20 group-hover:border-white/40'
                    }`}
                  >
                    {form.checklist[item] && <span className="text-black text-[10px] font-bold">✓</span>}
                  </div>
                  <span className="text-white/60 text-xs group-hover:text-white/80 transition-colors">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white hover:border-white/20 transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-[#37EFD1]/20 border border-[#37EFD1]/30 text-[#37EFD1] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all">
            {loading ? 'Creating...' : 'Create Log'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-[#37EFD1]/50 transition-colors placeholder:text-white/20';
