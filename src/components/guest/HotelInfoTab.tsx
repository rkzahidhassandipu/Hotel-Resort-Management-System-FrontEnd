// ── components/guest/HotelInfoTab.tsx ────────────────────
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { guestService } from '@/service/guest.service';
import { Modal, Field, inputCls } from './shared';
import { HotelInfo } from '@/types/guests.types';

export default function HotelInfoTab() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ key: '', value: '', description: '', isPublic: true });

  const { data: infoList = [], isLoading } = useQuery({
    queryKey: ['hotel-info-all'],
    queryFn: async () => {
      const res = await guestService.getHotelInfoAll();
      return (res.data?.data ?? []) as HotelInfo[];
    },
  });

  const upsertMut = useMutation({
    mutationFn: () => guestService.updateHotelInfo(form),
    onSuccess: () => {
      toast.success('Hotel info saved');
      qc.invalidateQueries({ queryKey: ['hotel-info-all'] });
      setShowForm(false);
      setForm({ key: '', value: '', description: '', isPublic: true });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (key: string) => guestService.deleteHotelInfoKey(key),
    onSuccess: () => {
      toast.success('Deleted');
      qc.invalidateQueries({ queryKey: ['hotel-info-all'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const handleEdit = (info: HotelInfo) => {
    setForm({ key: info.key, value: info.value, description: info.description ?? '', isPublic: info.isPublic });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg text-sm font-sans transition-all">
          <Plus size={14} /> Add Info
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>
      ) : infoList.length === 0 ? (
        <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-12 text-center">
          <Building2 className="h-8 w-8 text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm font-sans">No hotel info configured</p>
        </div>
      ) : (
        <div className="space-y-2">
          {infoList.map(info => (
            <div key={info.id} className="flex items-center justify-between bg-[#1A1B21] border border-white/5 rounded-xl p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white text-sm font-sans font-medium">{info.key}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans ${info.isPublic ? 'bg-green-400/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                    {info.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <p className="text-white/50 text-sm font-sans truncate">{info.value}</p>
                {info.description && <p className="text-white/30 text-xs font-sans mt-0.5">{info.description}</p>}
              </div>
              <div className="flex gap-1.5 ml-4 shrink-0">
                <button onClick={() => handleEdit(info)} className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white transition-all text-xs font-sans px-2.5">Edit</button>
                <button onClick={() => { if (confirm(`Delete "${info.key}"?`)) deleteMut.mutate(info.key); }} disabled={deleteMut.isPending}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={form.key ? `Edit: ${form.key}` : 'Add Hotel Info'} onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <Field label="Key *"><input value={form.key} onChange={e => setForm(p => ({ ...p, key: e.target.value }))} className={inputCls} placeholder="hotel_name" /></Field>
            <Field label="Value *"><textarea rows={3} value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} className={`${inputCls} resize-none`} placeholder="Value" /></Field>
            <Field label="Description"><input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={inputCls} placeholder="Optional description" /></Field>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.isPublic} onChange={e => setForm(p => ({ ...p, isPublic: e.target.checked }))} className="accent-[#37EFD1]" />
              <span className="text-white/50 text-sm font-sans">Public (visible to guests)</span>
            </label>
          </div>
          <div className="flex gap-2 mt-5 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-sans text-white/50 hover:text-white border border-white/10 rounded-lg transition-all">Cancel</button>
            <button onClick={() => upsertMut.mutate()} disabled={upsertMut.isPending}
              className="px-4 py-2 text-sm font-sans font-medium bg-[#C8102E] text-white rounded-lg hover:bg-[#a00d24] disabled:opacity-60 flex items-center gap-2 transition-all">
              {upsertMut.isPending && <Loader2 size={14} className="animate-spin" />}
              Save
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}