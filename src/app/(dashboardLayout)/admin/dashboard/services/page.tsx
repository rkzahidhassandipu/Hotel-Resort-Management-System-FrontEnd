'use client';
import { useState, useEffect, useCallback } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableSearch from '@/components/shared/table/DataTableSearch';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { serviceRequestService } from '@/service/service-request.service';
import type { ServiceRequest } from '@/types';

export default function AdminServicesPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ServiceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      const [sRes, statsRes] = await Promise.all([serviceRequestService.getAll(params), serviceRequestService.getStats()]);
      const d = sRes.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
      const rawSS = statsRes.data?.data || {};
      const bySRS: Record<string,number> = {};
      for (const s of (rawSS.byStatus || []) as Array<Record<string,unknown>>) {
        const k = String(s.status || '').toLowerCase();
        bySRS[k] = Number((s._count as Record<string,unknown>)?.status ?? 0);
      }
      setStats({
        total:      Object.values(bySRS).reduce((a,b) => a+b, 0),
        pending:    bySRS['pending']     || Number(rawSS.pendingCount || 0),
        inProgress: bySRS['in_progress'] || 0,
        completed:  bySRS['completed']   || 0,
      });
    } catch { setData([]); }
    setLoading(false);
  }, [page, search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id + status);
    try { await serviceRequestService.updateStatus(id, status); await fetchData(); } catch {}
    setActionLoading(null);
  };

  const columns: Column<ServiceRequest>[] = [
    { key: 'requestNumber', header: 'Request #', render: (_, r) => <span className="text-[#37EFD1] text-xs font-mono">{r.requestNumber}</span> },
    { key: 'type', header: 'Type', render: (_, r) => <span className="text-white/60 text-xs">{r.type.replace(/_/g, ' ')}</span> },
    { key: 'customer', header: 'Guest', render: (_, r) => r.customer ? <span className="text-white text-sm">{r.customer.firstName} {r.customer.lastName}</span> : <span className="text-white/40">—</span> },
    { key: 'priority', header: 'Priority', render: (_, r) => <span className={`text-xs px-2 py-0.5 rounded-full ${r.priority === 'URGENT' ? 'bg-[#C8102E]/15 text-[#C8102E]' : r.priority === 'HIGH' ? 'bg-[#fb923c]/15 text-[#fb923c]' : 'bg-white/5 text-white/40'}`}>{r.priority}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    { key: 'createdAt', header: 'Created', render: (_, r) => <DateCell date={r.createdAt} /> },
    {
      key: 'id', header: 'Actions', render: (_, r) => (
        <div className="flex gap-1">
          {r.status === 'PENDING' && <button onClick={() => updateStatus(r.id, 'IN_PROGRESS')} disabled={!!actionLoading} className="text-[9px] px-2 py-0.5 rounded border border-[#60a5fa]/30 text-[#60a5fa] hover:bg-[#60a5fa]/10 transition-all">{actionLoading === r.id + 'IN_PROGRESS' ? '...' : 'Start'}</button>}
          {r.status === 'IN_PROGRESS' && <button onClick={() => updateStatus(r.id, 'COMPLETED')} disabled={!!actionLoading} className="text-[9px] px-2 py-0.5 rounded border border-[#37EFD1]/30 text-[#37EFD1] hover:bg-[#37EFD1]/10 transition-all">{actionLoading === r.id + 'COMPLETED' ? '...' : 'Complete'}</button>}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">Service Requests</h1><p className="text-white/35 text-sm font-sans mt-0.5">Manage guest service requests</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Requests" value={stats.total || 0} icon={Bell} color="#37EFD1" />
        <StatsCard title="Pending" value={stats.pending || 0} icon={Bell} color="#fb923c" />
        <StatsCard title="In Progress" value={stats.inProgress || 0} icon={Bell} color="#60a5fa" />
        <StatsCard title="Completed" value={stats.completed || 0} icon={Bell} color="#a78bfa" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <DataTableSearch value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search service requests..." />
          <DataTableFilters
            filters={[
              { key: 'status', label: 'All Statuses', options: [{ label: 'Pending', value: 'PENDING' }, { label: 'Assigned', value: 'ASSIGNED' }, { label: 'In Progress', value: 'IN_PROGRESS' }, { label: 'Completed', value: 'COMPLETED' }] },
              { key: 'type', label: 'All Types', options: [{ label: 'Laundry', value: 'LAUNDRY' }, { label: 'Room Service', value: 'ROOM_SERVICE' }, { label: 'Spa Booking', value: 'SPA_BOOKING' }, { label: 'Taxi', value: 'TAXI_BOOKING' }] },
            ]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ status: '', type: '' }); setPage(1); }} />
        </div>
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
