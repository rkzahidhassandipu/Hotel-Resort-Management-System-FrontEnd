'use client';
import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { useForm } from '@tanstack/react-form';
import { maintenanceService } from '@/service/maintenance.service';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const TYPES = ['ELECTRICAL', 'PLUMBING', 'HVAC', 'FURNITURE', 'CLEANING', 'SECURITY', 'OTHER'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

type FormValues = {
  title: string;
  description: string;
  type: string;
  priority: string;
  roomNumber: string;
  location: string;
  scheduledAt: string;
};

export default function CreateMaintenanceModal({ onClose, onSuccess }: Props) {
  const [submitError, setSubmitError] = useState('');

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      type: 'ELECTRICAL',
      priority: 'MEDIUM',
      roomNumber: '',
      location: '',
      scheduledAt: '',
    } as FormValues,
    onSubmit: async ({ value }) => {
      setSubmitError('');
      const roomNumber = value.roomNumber.trim();
      const location = value.location.trim();

      console.log('Form values:', value);

      if (!roomNumber && !location) {
        setSubmitError('Room Number অথবা Location দিতে হবে');
        return;
      }

      const payload = {
        title: value.title.trim(),
        description: value.description.trim(),
        type: value.type,
        priority: value.priority,
        ...(roomNumber && { roomNumber }),
        ...(location && { location }),
        // datetime-local gives "2026-06-19T20:56" (no seconds, no offset);
        // backend Zod schema requires full ISO 8601 with offset.
        ...(value.scheduledAt && { scheduledAt: new Date(value.scheduledAt).toISOString() }),
      };

      console.log('Payload sent to createTicket:', payload);

      try {
        await maintenanceService.createTicket(payload);
        onSuccess();
        onClose();
      } catch (e: any) {
        console.error('createTicket error:', e);
        setSubmitError(e?.response?.data?.message || e?.message || 'Failed to create ticket');
      }
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#13141A] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-white font-semibold">New Maintenance Ticket</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            {submitError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-4 py-2.5">
                {submitError}
              </div>
            )}

            <form.Field
              name="title"
              validators={{
                onChange: ({ value }) => (!value.trim() ? 'Title is required' : undefined),
              }}
            >
              {(field) => (
                <Field label="Title *" error={field.state.meta.errors[0]}>
                  <input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={inputCls}
                    placeholder="e.g. AC not working"
                  />
                </Field>
              )}
            </form.Field>

            <form.Field
              name="description"
              validators={{
                onChange: ({ value }) => (!value.trim() ? 'Description is required' : undefined),
              }}
            >
              {(field) => (
                <Field label="Description *" error={field.state.meta.errors[0]}>
                  <textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={`${inputCls} min-h-[72px] resize-none`}
                    placeholder="Describe the issue..."
                  />
                </Field>
              )}
            </form.Field>

            <div className="grid grid-cols-2 gap-3">
              <form.Field name="type">
                {(field) => (
                  <Field label="Type">
                    <Dropdown
                      value={field.state.value}
                      options={TYPES.map(t => ({ value: t, label: t.replace('_', ' ') }))}
                      onChange={field.handleChange}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="priority">
                {(field) => (
                  <Field label="Priority">
                    <Dropdown
                      value={field.state.value}
                      options={PRIORITIES.map(p => ({ value: p, label: p }))}
                      onChange={field.handleChange}
                      renderOption={(opt) => (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${priorityStyle[opt.value]}`}>
                          {opt.label}
                        </span>
                      )}
                    />
                  </Field>
                )}
              </form.Field>
            </div>

            {/* Priority badge preview */}
            <form.Subscribe selector={(state) => state.values.priority}>
              {(priority) => (
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${priorityStyle[priority]}`}>
                    {priority}
                  </span>
                  <span className="text-white/30 text-xs">priority selected</span>
                </div>
              )}
            </form.Subscribe>

            <div className="grid grid-cols-2 gap-3">
              <form.Field name="roomNumber">
                {(field) => (
                  <Field label="Room Number">
                    <input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className={inputCls}
                      placeholder="e.g. 204"
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="location">
                {(field) => (
                  <Field label="Location (if no room)">
                    <input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className={inputCls}
                      placeholder="e.g. Lobby, Pool"
                    />
                  </Field>
                )}
              </form.Field>
            </div>

            <form.Field name="scheduledAt">
              {(field) => (
                <Field label="Scheduled At">
                  <input
                    type="datetime-local"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={inputCls}
                  />
                </Field>
              )}
            </form.Field>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white hover:border-white/20 transition-all"
            >
              Cancel
            </button>
            <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit]}>
              {([isSubmitting, canSubmit]) => (
                <button
                  type="submit"
                  disabled={isSubmitting || !canSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-[#37EFD1]/20 border border-[#37EFD1]/30 text-[#37EFD1] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Creating...' : 'Create Ticket'}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

type Option = { value: string; label: string };

function Dropdown({
  value,
  options,
  onChange,
  renderOption,
}: {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  renderOption?: (option: Option) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`${inputCls} flex items-center justify-between cursor-pointer`}
      >
        <span>{selected?.label ?? value}</span>
        <ChevronDown
          size={14}
          className={`text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-[#1A1B21] border border-white/10 rounded-lg shadow-xl py-1 max-h-56 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-white/80 hover:bg-white/5 transition-colors text-left"
            >
              {renderOption ? renderOption(opt) : opt.label}
              {opt.value === value && <Check size={14} className="text-[#37EFD1]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const priorityStyle: Record<string, string> = {
  LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  URGENT: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const inputCls =
  'w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-[#37EFD1]/50 transition-colors placeholder:text-white/20 [color-scheme:dark]';