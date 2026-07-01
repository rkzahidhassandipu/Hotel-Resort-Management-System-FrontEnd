// app/(dashboard)/maintenance/housekeeping/page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Home, Loader2, CheckCircle, Plus, X } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { maintenanceService } from '@/service/maintenance.service';
import { HousekeepingLog } from '@/types';

const HK_TYPES = ['DAILY_CLEANING', 'DEEP_CLEANING', 'TURNDOWN', 'INSPECTION'];

export default function MaintenanceHousekeepingPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<HousekeepingLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [form, setForm] = useState({ roomId: '', type: 'DAILY_CLEANING', notes: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await maintenanceService.getHousekeepingLogs({ page, limit: 10 });
      const d = res.data?.data;
      setData(d?.data || d || []);
      setTotal(res.data?.meta?.total ?? d?.total ?? 0);
    } catch {
      setData([]);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const complete = async (id: string) => {
    setActionLoading(id);
    try { await maintenanceService.completeHousekeeping(id); await fetchData(); } catch {}
    setActionLoading(null);
  };

  const handleCreate = async () => {
    if (!form.roomId.trim()) {
      setCreateError('Room ID is required');
      return;
    }
    setCreating(true);
    setCreateError('');
    try {
      await maintenanceService.createHousekeepingLog({
        roomId: form.roomId,
        type: form.type,
        status: 'IN_PROGRESS',
        notes: form.notes || undefined,
      });
      setShowCreate(false);
      setForm({ roomId: '', type: 'DAILY_CLEANING', notes: '' });
      await fetchData();
    } catch (e: any) {
      setCreateError(e?.response?.data?.message || 'Failed to create log');
    }
    setCreating(false);
  };

  const columns: Column<HousekeepingLog>[] = [
    { key: 'room', header: 'Room', render: (_, r) => <span className="text-[#37EFD1] font-mono text-sm">#{r.room?.roomNumber || '—'}</span> },
    { key: 'type', header: 'Type', render: (_, r) => <span className="text-white/60 text-xs">{r.type}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'COMPLETED' ? 'bg-[#37EFD1]/15 text-[#37EFD1]' : 'bg-[#fb923c]/15 text-[#fb923c]'}`}>{r.status}</span> },
    { key: 'staff', header: 'Staff', render: (_, r) => r.staff ? <span className="text-white/60 text-xs">{r.staff.firstName}</span> : <span className="text-white/25 text-xs">Unassigned</span> },
    { key: 'date', header: 'Date', render: (_, r) => <DateCell date={r.date} /> },
    {
      key: 'id', header: 'Actions', render: (_, r) => (
        r.status !== 'COMPLETED' ? (
          <button onClick={() => complete(r.id)} disabled={!!actionLoading} className="p-1.5 rounded text-[#37EFD1] hover:bg-[#37EFD1]/10 transition-colors">
            {actionLoading === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
          </button>
        ) : <span className="text-white/20 text-xs">Done</span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white font-semibold">Housekeeping Logs</h1>
          <p className="text-white/35 text-sm font-sans mt-0.5">Room cleaning and housekeeping records</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-[#37EFD1] text-[#0B0C10] font-medium text-sm rounded-lg px-4 py-2 hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> New Log
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Logs" value={total} icon={Home} color="#37EFD1" />
        <StatsCard title="Pending" value={data.filter((l) => l.status !== 'COMPLETED').length} icon={Home} color="#fb923c" />
        <StatsCard title="Completed" value={data.filter((l) => l.status === 'COMPLETED').length} icon={Home} color="#a78bfa" />
        <StatsCard title="Today" value={data.filter((l) => new Date(l.date).toDateString() === new Date().toDateString()).length} icon={Home} color="#60a5fa" />
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>
        ) : (
          <>
            <DataTable data={data} columns={columns} />
            <DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} />
          </>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCreate(false)} />
          <div className="relative bg-[#1A1B21] border border-white/10 rounded-xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">New Housekeeping Log</h3>
              <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            {createError && <div className="bg-[#C8102E]/10 text-[#C8102E] text-xs rounded-lg px-3 py-2">{createError}</div>}
            <input placeholder="Room ID" value={form.roomId} onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))}
              className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
              {HK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <textarea placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-3 py-2 text-white text-sm min-h-[60px]" />
            <button onClick={handleCreate} disabled={creating}
              className="w-full bg-[#37EFD1] text-[#0B0C10] font-medium rounded-lg py-2 flex items-center justify-center gap-2 disabled:opacity-50">
              {creating && <Loader2 className="h-4 w-4 animate-spin" />} Create Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
}