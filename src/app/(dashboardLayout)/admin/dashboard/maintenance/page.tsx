'use client';
import { useState, useEffect, useCallback } from 'react';
import { Wrench, Loader2, UserCheck } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableSearch from '@/components/shared/table/DataTableSearch';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { maintenanceService } from '@/service/maintenance.service';
import type { MaintenanceLog } from '@/types';
import { parseMaintenanceStats } from '@/lib/statsUtils';

export default function AdminMaintenancePage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<MaintenanceLog[]>([]);
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
      if (filters.priority) params.priority = filters.priority;
      const [mRes, sRes] = await Promise.all([maintenanceService.getAll(params), maintenanceService.getStats()]);
      const d = mRes.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
      setStats(parseMaintenanceStats(sRes.data?.data || {}));
    } catch { setData([]); }
    setLoading(false);
  }, [page, search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleComplete = async (id: string) => {
    setActionLoading(id + 'complete');
    try { await maintenanceService.complete(id); await fetchData(); } catch {}
    setActionLoading(null);
  };

  const handleCancel = async (id: string) => {
    setActionLoading(id + 'cancel');
    try { await maintenanceService.cancel(id); await fetchData(); } catch {}
    setActionLoading(null);
  };

  const priorityColor: Record<string, string> = { LOW: '#37EFD1', MEDIUM: '#60a5fa', HIGH: '#fb923c', URGENT: '#C8102E' };

  const columns: Column<MaintenanceLog>[] = [
    { key: 'ticketNumber', header: 'Ticket #', render: (_, r) => <span className="text-[#37EFD1] text-xs font-mono">{r.ticketNumber}</span> },
    { key: 'title', header: 'Issue', render: (_, r) => <span className="text-white text-sm">{r.title}</span> },
    { key: 'type', header: 'Type', render: (_, r) => <span className="text-white/50 text-xs">{r.type}</span> },
    { key: 'priority', header: 'Priority', render: (_, r) => <span className="text-xs font-sans px-2 py-0.5 rounded-full" style={{ color: priorityColor[r.priority], background: priorityColor[r.priority] + '20' }}>{r.priority}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    { key: 'assignedTo', header: 'Assigned', render: (_, r) => r.assignedTo ? <span className="text-white/60 text-xs">{r.assignedTo.firstName}</span> : <span className="text-white/25 text-xs">Unassigned</span> },
    { key: 'createdAt', header: 'Reported', render: (_, r) => <DateCell date={r.createdAt} /> },
    {
      key: 'id', header: 'Actions', render: (_, r) => (
        <div className="flex gap-1">
          {!['COMPLETED', 'CANCELLED'].includes(r.status) && <>
            <button onClick={() => handleComplete(r.id)} disabled={!!actionLoading} className="text-[9px] px-2 py-0.5 rounded border border-[#37EFD1]/30 text-[#37EFD1] hover:bg-[#37EFD1]/10 transition-all"><UserCheck className="h-3 w-3 inline mr-0.5" />{actionLoading === r.id + 'complete' ? '...' : 'Done'}</button>
            <button onClick={() => handleCancel(r.id)} disabled={!!actionLoading} className="text-[9px] px-2 py-0.5 rounded border border-[#C8102E]/30 text-[#C8102E] hover:bg-[#C8102E]/10 transition-all">{actionLoading === r.id + 'cancel' ? '...' : 'Cancel'}</button>
          </>}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">Maintenance</h1><p className="text-white/35 text-sm font-sans mt-0.5">Track and manage maintenance requests</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Tickets" value={stats.total || 0} icon={Wrench} color="#37EFD1" />
        <StatsCard title="Pending" value={stats.pending || 0} icon={Wrench} color="#fb923c" />
        <StatsCard title="In Progress" value={stats.inProgress || 0} icon={Wrench} color="#60a5fa" />
        <StatsCard title="Completed" value={stats.completed || 0} icon={Wrench} color="#a78bfa" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <DataTableSearch value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search maintenance tickets..." />
          <DataTableFilters
            filters={[
              { key: 'status', label: 'All Statuses', options: [{ label: 'Pending', value: 'PENDING' }, { label: 'In Progress', value: 'IN_PROGRESS' }, { label: 'Completed', value: 'COMPLETED' }, { label: 'On Hold', value: 'ON_HOLD' }] },
              { key: 'priority', label: 'All Priorities', options: [{ label: 'Low', value: 'LOW' }, { label: 'Medium', value: 'MEDIUM' }, { label: 'High', value: 'HIGH' }, { label: 'Urgent', value: 'URGENT' }] },
            ]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ status: '', priority: '' }); setPage(1); }} />
        </div>
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
