// ── components/guest/InquiriesTab.tsx ────────────────────
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, CheckCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import { guestService } from '@/service/guest.service';
import { Modal, Field, inputCls, selectCls, fmtDate } from './shared';
import { Inquiry } from '@/types/guests.types';

export default function InquiriesTab() {
  const qc = useQueryClient();
  const [page, setPage]           = useState(1);
  const [isResolved, setIsResolved] = useState('');
  const [selected, setSelected]   = useState<Inquiry | null>(null);
  const [notes, setNotes]         = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['inquiries', page, isResolved],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (isResolved) params.isResolved = isResolved;
      const res = await guestService.getInquiries(params);
      const d = res.data?.data;
      return {
        inquiries: Array.isArray(d) ? d : (d?.inquiries ?? []),
        meta: res.data?.meta ?? d?.meta,
      } as { inquiries: Inquiry[]; meta: any };
    },
  });

  const resolveMut = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => guestService.resolveInquiry(id, notes),
    onSuccess: () => {
      toast.success('Inquiry resolved');
      qc.invalidateQueries({ queryKey: ['inquiries'] });
      qc.invalidateQueries({ queryKey: ['guest-stats'] });
      setSelected(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => guestService.deleteInquiry(id),
    onSuccess: () => {
      toast.success('Inquiry deleted');
      qc.invalidateQueries({ queryKey: ['inquiries'] });
      qc.invalidateQueries({ queryKey: ['guest-stats'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const inquiries = data?.inquiries ?? [];
  const meta      = data?.meta;

  const columns: Column<Inquiry>[] = [
    {
      key: 'name', header: 'Guest',
      render: (_, r) => (
        <div>
          <p className="text-white text-sm font-sans">{r.name}</p>
          <p className="text-white/40 text-xs font-sans">{r.email}</p>
        </div>
      ),
    },
    { key: 'roomType',  header: 'Room',     render: (_, r) => <span className="text-white/60 text-sm font-sans">{r.roomType ?? 'Any'}</span> },
    { key: 'checkIn',   header: 'Dates',    render: (_, r) => <span className="text-white/60 text-xs font-sans">{fmtDate(r.checkIn)} → {fmtDate(r.checkOut)}</span> },
    { key: 'createdAt', header: 'Received', render: (_, r) => <span className="text-white/40 text-xs font-sans">{fmtDate(r.createdAt)}</span> },
    {
      key: 'isResolved', header: 'Status',
      render: (_, r) => r.isResolved
        ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 font-sans">Resolved</span>
        : <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 font-sans">Open</span>,
    },
    {
      key: 'id', header: '',
      render: (_, r) => (
        <div className="flex gap-1.5">
          <button onClick={() => setSelected(r)} className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white transition-all"><Eye size={13} /></button>
          <button onClick={() => { if (confirm('Delete this inquiry?')) deleteMut.mutate(r.id); }} disabled={deleteMut.isPending}
            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40">
            {deleteMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select value={isResolved} onChange={e => { setIsResolved(e.target.value); setPage(1); }} className={`${selectCls} w-40`}>
          <option value="">All Inquiries</option>
          <option value="false">Open</option>
          <option value="true">Resolved</option>
        </select>
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {isLoading
          ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>
          : <><DataTable data={inquiries as any} columns={columns as any} /><DataTablePagination page={page} totalPages={meta?.totalPages ?? 1} onPage={setPage} total={meta?.total ?? 0} limit={10} /></>
        }
      </div>

      {selected && (
        <Modal title="Inquiry Details" onClose={() => setSelected(null)}>
          <div className="space-y-3">
            {[
              { label: 'Name',      value: selected.name },
              { label: 'Email',     value: selected.email },
              { label: 'Phone',     value: selected.phone ?? '—' },
              { label: 'Check-in',  value: fmtDate(selected.checkIn) },
              { label: 'Check-out', value: fmtDate(selected.checkOut) },
              { label: 'Guests',    value: `${selected.adults} adults, ${selected.children} children` },
              { label: 'Room Type', value: selected.roomType ?? 'Any' },
              { label: 'Budget',    value: selected.budget ? `RM ${selected.budget}` : '—' },
              { label: 'Message',   value: selected.message ?? '—' },
            ].map(r => (
              <div key={r.label} className="flex gap-3">
                <span className="text-white/30 text-xs font-sans min-w-[80px] pt-0.5">{r.label}</span>
                <span className="text-white/80 text-sm font-sans">{r.value}</span>
              </div>
            ))}
            {!selected.isResolved && (
              <div className="border-t border-white/8 pt-3 space-y-2">
                <Field label="Resolution Notes">
                  <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} className={`${inputCls} resize-none`} placeholder="Optional notes" />
                </Field>
                <button onClick={() => resolveMut.mutate({ id: selected.id, notes: notes || undefined })} disabled={resolveMut.isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-sm font-sans transition-all disabled:opacity-60">
                  {resolveMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Mark as Resolved
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}