'use client';
import { useState, useEffect, useCallback } from 'react';
import { Bell, Loader2, XCircle } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { serviceRequestService } from '@/service/service-request.service';
import type { ServiceRequest } from '@/types';

export default function CustomerServicesPage() {
  const [filters, setFilters] = useState({ status: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ServiceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (filters.status) params.status = filters.status;
      const res = await serviceRequestService.getAll(params);
      const d = res.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
    } catch { setData([]); }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const cancel = async (id: string) => {
    setActionLoading(id);
    try { await serviceRequestService.cancel(id); await fetchData(); } catch {}
    setActionLoading(null);
  };

  const columns: Column<ServiceRequest>[] = [
    { key: 'requestNumber', header: 'Request #', render: (_, r) => <span className="text-[#37EFD1] text-xs font-mono">{r.requestNumber}</span> },
    { key: 'type', header: 'Type', render: (_, r) => <span className="text-white/60 text-xs">{r.type.replace(/_/g, ' ')}</span> },
    { key: 'priority', header: 'Priority', render: (_, r) => <span className="text-white/50 text-xs">{r.priority}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    { key: 'createdAt', header: 'Created', render: (_, r) => <DateCell date={r.createdAt} /> },
    {
      key: 'id', header: 'Actions', render: (_, r) => (
        <div className="flex gap-1">
          {!['COMPLETED', 'CANCELLED'].includes(r.status) && (
            <button onClick={() => cancel(r.id)} disabled={!!actionLoading} className="p-1.5 rounded text-[#C8102E] hover:bg-[#C8102E]/10 transition-colors">
              {actionLoading === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">Service Requests</h1><p className="text-white/35 text-sm font-sans mt-0.5">Your hotel service requests</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Requests" value={total} icon={Bell} color="#37EFD1" />
        <StatsCard title="Pending" value={data.filter(r => r.status === 'PENDING').length} icon={Bell} color="#fb923c" />
        <StatsCard title="In Progress" value={data.filter(r => r.status === 'IN_PROGRESS').length} icon={Bell} color="#60a5fa" />
        <StatsCard title="Completed" value={data.filter(r => r.status === 'COMPLETED').length} icon={Bell} color="#a78bfa" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
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
