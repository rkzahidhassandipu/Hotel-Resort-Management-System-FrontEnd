// app/(dashboard)/maintenance/requests/page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Wrench, Loader2, CheckCircle, Plus, Eye, Ban } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { maintenanceService } from '@/service/maintenance.service';
import type { MaintenanceLog, MaintenanceStats } from '@/types';
import MaintenanceTicketPanel from '@/components/maintenance/MaintenanceTicketPanel';

export default function MaintenanceRequestsPage() {
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<MaintenanceLog[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'create' | 'view'>('create');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const [mRes, sRes] = await Promise.all([
        maintenanceService.getAll(params),
        maintenanceService.getStats(),
      ]);
      const d = mRes.data?.data;
      setData(d?.data || d || []);
      setTotal(mRes.data?.meta?.total ?? d?.total ?? 0);
      setStats(sRes.data?.data ?? null);
    } catch {
      setData([]);
    }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const complete = async (id: string) => {
    setActionLoading(id);
    try { await maintenanceService.complete(id, { actualHours: 0 }); await fetchData(); } catch {}
    setActionLoading(null);
  };

  const openCreate = () => { setPanelMode('create'); setSelectedId(null); setPanelOpen(true); };
  const openView = (id: string) => { setPanelMode('view'); setSelectedId(id); setPanelOpen(true); };

  const priorityColor: Record<string, string> = { LOW: '#37EFD1', MEDIUM: '#60a5fa', HIGH: '#fb923c', URGENT: '#C8102E' };

  const columns: Column<MaintenanceLog>[] = [
    { key: 'ticketNumber', header: 'Ticket #', render: (_, r) => <span className="text-[#37EFD1] text-xs font-mono">{r.ticketNumber}</span> },
    { key: 'title', header: 'Issue', render: (_, r) => <span className="text-white text-sm">{r.title}</span> },
    { key: 'type', header: 'Type', render: (_, r) => <span className="text-white/50 text-xs">{r.type}</span> },
    { key: 'priority', header: 'Priority', render: (_, r) => <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: priorityColor[r.priority], background: priorityColor[r.priority] + '20' }}>{r.priority}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    { key: 'room', header: 'Location', render: (_, r) => <span className="text-white/50 text-xs">{r.room?.roomNumber ? `Room #${r.room.roomNumber}` : r.location || '—'}</span> },
    { key: 'assignedTo', header: 'Assigned', render: (_, r) => <span className="text-white/50 text-xs">{r.assignedTo ? `${r.assignedTo.firstName} ${r.assignedTo.lastName}` : 'Unassigned'}</span> },
    { key: 'createdAt', header: 'Reported', render: (_, r) => <DateCell date={r.createdAt} /> },
    {
      key: 'id', header: 'Actions', render: (_, r) => (
        <div className="flex gap-1">
          <button onClick={() => openView(r.id)} className="p-1.5 rounded text-white/50 hover:bg-white/10 transition-colors" title="View Details">
            <Eye className="h-3.5 w-3.5" />
          </button>
          {r.status === 'IN_PROGRESS' && (
            <button onClick={() => complete(r.id)} disabled={!!actionLoading} className="p-1.5 rounded text-[#37EFD1] hover:bg-[#37EFD1]/10 transition-colors" title="Mark Complete">
              {actionLoading === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
            </button>
          )}
          {!['COMPLETED', 'CANCELLED'].includes(r.status) && (
            <button onClick={() => openView(r.id)} className="p-1.5 rounded text-[#C8102E] hover:bg-[#C8102E]/10 transition-colors" title="Cancel">
              <Ban className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white font-semibold">Maintenance Requests</h1>
          <p className="text-white/35 text-sm font-sans mt-0.5">View and update assigned maintenance tickets</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#37EFD1] text-[#0B0C10] font-medium text-sm rounded-lg px-4 py-2 hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> New Ticket
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Tickets" value={stats?.total || 0} icon={Wrench} color="#37EFD1" />
        <StatsCard title="Pending" value={stats?.pending || 0} icon={Wrench} color="#fb923c" />
        <StatsCard title="In Progress" value={stats?.inProgress || 0} icon={Wrench} color="#60a5fa" />
        <StatsCard title="Completed" value={stats?.completed || 0} icon={Wrench} color="#a78bfa" />
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex gap-3 mb-4">
          <DataTableFilters
            filters={[
              { key: 'status', label: 'All Statuses', options: [{ label: 'Pending', value: 'PENDING' }, { label: 'In Progress', value: 'IN_PROGRESS' }, { label: 'Completed', value: 'COMPLETED' }, { label: 'Cancelled', value: 'CANCELLED' }] },
              { key: 'priority', label: 'All Priorities', options: [{ label: 'Low', value: 'LOW' }, { label: 'Medium', value: 'MEDIUM' }, { label: 'High', value: 'HIGH' }, { label: 'Urgent', value: 'URGENT' }] },
            ]}
            values={filters} onChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ status: '', priority: '' }); setPage(1); }} />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>
        ) : (
          <>
            <DataTable data={data as any} columns={columns as any} />
            <DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} />
          </>
        )}
      </div>

      <MaintenanceTicketPanel
        open={panelOpen}
        mode={panelMode}
        ticketId={selectedId}
        onClose={() => setPanelOpen(false)}
        onSaved={fetchData}
      />
    </div>
  );
}