'use client';
import { useState, useEffect, useCallback } from 'react';
import { Home, Loader2, CheckCircle } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { maintenanceService } from '@/service/maintenance.service';
import type { HousekeepingLog } from '@/types';

export default function MaintenanceHousekeepingPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<HousekeepingLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await maintenanceService.getHousekeepingLogs({ page, limit: 10 });
      const d = res.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
    } catch { setData([]); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const complete = async (id: string) => {
    setActionLoading(id);
    try { await maintenanceService.completeHousekeeping(id); await fetchData(); } catch {}
    setActionLoading(null);
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
      <div><h1 className="font-display text-2xl text-white font-semibold">Housekeeping Logs</h1><p className="text-white/35 text-sm font-sans mt-0.5">Room cleaning and housekeeping records</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Logs" value={total} icon={Home} color="#37EFD1" />
        <StatsCard title="Pending" value={data.filter(l => l.status !== 'COMPLETED').length} icon={Home} color="#fb923c" />
        <StatsCard title="Completed" value={data.filter(l => l.status === 'COMPLETED').length} icon={Home} color="#a78bfa" />
        <StatsCard title="Today" value={data.filter(l => new Date(l.date).toDateString() === new Date().toDateString()).length} icon={Home} color="#60a5fa" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
