'use client';
import { useState, useEffect, useCallback } from 'react';
import { Home, Loader2, CheckCircle } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { maintenanceService } from '@/service/maintenance.service';
import type { HousekeepingLog } from '@/types';

export default function StaffHousekeepingPage() {
  const [filters, setFilters] = useState({ status: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<HousekeepingLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (filters.status) params.status = filters.status;
      const res = await maintenanceService.getHousekeepingLogs(params);
      const d = res.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
    } catch { setData([]); }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const completeLog = async (id: string) => {
    setActionLoading(id);
    try { await maintenanceService.completeHousekeeping(id); await fetchData(); } catch {}
    setActionLoading(null);
  };

  const columns: Column<HousekeepingLog>[] = [
    { key: 'room', header: 'Room', render: (_, r) => <span className="text-[#37EFD1] font-mono text-sm">#{r.room?.roomNumber || '—'}</span> },
    { key: 'type', header: 'Type', render: (_, r) => <span className="text-white/60 text-xs">{r.type}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'COMPLETED' ? 'bg-[#37EFD1]/15 text-[#37EFD1]' : r.status === 'IN_PROGRESS' ? 'bg-[#60a5fa]/15 text-[#60a5fa]' : 'bg-[#fb923c]/15 text-[#fb923c]'}`}>{r.status}</span> },
    { key: 'date', header: 'Date', render: (_, r) => <DateCell date={r.date} /> },
    { key: 'startedAt', header: 'Started', render: (_, r) => r.startedAt ? <DateCell date={r.startedAt} /> : <span className="text-white/25 text-xs">—</span> },
    {
      key: 'id', header: 'Actions', render: (_, r) => (
        <div className="flex gap-1">
          {r.status !== 'COMPLETED' && (
            <button onClick={() => completeLog(r.id)} disabled={!!actionLoading} className="p-1.5 rounded text-[#37EFD1] hover:bg-[#37EFD1]/10 transition-colors">
              {actionLoading === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">Housekeeping</h1><p className="text-white/35 text-sm font-sans mt-0.5">Room cleaning and preparation logs</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Logs" value={total} icon={Home} color="#37EFD1" />
        <StatsCard title="Pending" value={data.filter(l => l.status === 'PENDING').length} icon={Home} color="#fb923c" />
        <StatsCard title="In Progress" value={data.filter(l => l.status === 'IN_PROGRESS').length} icon={Home} color="#60a5fa" />
        <StatsCard title="Completed" value={data.filter(l => l.status === 'COMPLETED').length} icon={Home} color="#a78bfa" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex gap-3 mb-4">
          <DataTableFilters filters={[{ key: 'status', label: 'All Statuses', options: [{ label: 'Pending', value: 'PENDING' }, { label: 'In Progress', value: 'IN_PROGRESS' }, { label: 'Completed', value: 'COMPLETED' }] }]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ status: '' }); setPage(1); }} />
        </div>
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
