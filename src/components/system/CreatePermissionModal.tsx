// ── components/system/CreatePermissionModal.tsx ───────────
'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { systemService } from '@/service/system.service';
import { inputCls } from '@/types/system.types';

export default function CreatePermissionModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName]         = useState('');
  const [resource, setResource] = useState('');
  const [action, setAction]     = useState('');
  const [desc, setDesc]         = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await systemService.createPermission({ name, resource, action, description: desc || undefined });
      toast.success('Permission created');
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#1A1B21] border border-white/8 rounded-2xl p-6 w-full max-w-md space-y-4 z-10"
        onClick={e => e.stopPropagation()}>
        <h2 className="text-white font-display font-semibold text-lg">Create Permission</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { label: 'Name', value: name, onChange: setName, placeholder: 'e.g. view_reports' },
            { label: 'Resource', value: resource, onChange: setResource, placeholder: 'e.g. reports' },
            { label: 'Action', value: action, onChange: setAction, placeholder: 'e.g. READ' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-white/50 text-xs uppercase tracking-widest font-sans mb-1 block">{f.label}</label>
              <input required value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder} className={inputCls} />
            </div>
          ))}
          <div>
            <label className="text-white/50 text-xs uppercase tracking-widest font-sans mb-1 block">
              Description <span className="text-white/25 normal-case">(optional)</span>
            </label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What this permission allows" className={inputCls} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={submitting}
              className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-sans text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-all">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}