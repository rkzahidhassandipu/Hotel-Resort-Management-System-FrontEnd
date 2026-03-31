'use client';
import { useState, useEffect, useCallback } from 'react';
import { CheckSquare, Loader2 } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { staffService } from '@/service/staff.service';
import type { StaffTask } from '@/types';

export default function StaffTasksPage() {
  const [filters, setFilters] = useState({ status: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<StaffTask[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await staffService.getMyTasks();
      const d = res.data?.data;
      const tasks: StaffTask[] = Array.isArray(d) ? d : d?.data || [];
      const filtered = tasks.filter(t => !filters.status || t.status === filters.status);
      setData(filtered.slice((page - 1) * 10, page * 10));
      setTotal(filtered.length);
    } catch { setData([]); }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id + status);
    try { await staffService.updateTaskStatus(id, status); await fetchData(); } catch {}
    setActionLoading(null);
  };

  const priorityColor: Record<string, string> = { LOW: '#37EFD1', MEDIUM: '#60a5fa', HIGH: '#fb923c', URGENT: '#C8102E' };

  const columns: Column<StaffTask>[] = [
    { key: 'title', header: 'Task', render: (_, r) => <div><p className="text-white text-sm">{r.title}</p>{r.description && <p className="text-white/30 text-xs">{r.description.slice(0, 50)}</p>}</div> },
    { key: 'priority', header: 'Priority', render: (_, r) => <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: priorityColor[r.priority], background: priorityColor[r.priority] + '20' }}>{r.priority}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    { key: 'dueDate', header: 'Due Date', render: (_, r) => r.dueDate ? <DateCell date={r.dueDate} /> : <span className="text-white/25 text-xs">—</span> },
    {
      key: 'id', header: 'Actions', render: (_, r) => (
        <div className="flex gap-1">
          {r.status === 'ASSIGNED' && <button onClick={() => updateStatus(r.id, 'IN_PROGRESS')} disabled={!!actionLoading} className="text-[9px] px-2 py-0.5 rounded border border-[#60a5fa]/30 text-[#60a5fa] hover:bg-[#60a5fa]/10">{actionLoading === r.id + 'IN_PROGRESS' ? '...' : 'Start'}</button>}
          {r.status === 'IN_PROGRESS' && <button onClick={() => updateStatus(r.id, 'COMPLETED')} disabled={!!actionLoading} className="text-[9px] px-2 py-0.5 rounded border border-[#37EFD1]/30 text-[#37EFD1] hover:bg-[#37EFD1]/10">{actionLoading === r.id + 'COMPLETED' ? '...' : 'Complete'}</button>}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">My Tasks</h1><p className="text-white/35 text-sm font-sans mt-0.5">Tasks assigned to you</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Tasks" value={total} icon={CheckSquare} color="#37EFD1" />
        <StatsCard title="Assigned" value={data.filter(t => t.status === 'ASSIGNED').length} icon={CheckSquare} color="#fb923c" />
        <StatsCard title="In Progress" value={data.filter(t => t.status === 'IN_PROGRESS').length} icon={CheckSquare} color="#60a5fa" />
        <StatsCard title="Completed" value={data.filter(t => t.status === 'COMPLETED').length} icon={CheckSquare} color="#a78bfa" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex gap-3 mb-4">
          <DataTableFilters filters={[{ key: 'status', label: 'All Statuses', options: [{ label: 'Assigned', value: 'ASSIGNED' }, { label: 'In Progress', value: 'IN_PROGRESS' }, { label: 'Completed', value: 'COMPLETED' }] }]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ status: '' }); setPage(1); }} />
        </div>
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
