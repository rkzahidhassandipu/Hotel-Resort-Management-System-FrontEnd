'use client';
import { useState, useEffect, useCallback } from 'react';
import { Users, Loader2, CheckSquare, Plus } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableSearch from '@/components/shared/table/DataTableSearch';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import UserInfoCell from '@/components/shared/cell/UserInfoCell';
import StatsCard from '@/components/shared/StatsCard';
import { userService } from '@/service/user.service';
import { staffService } from '@/service/staff.service';
import { parseStaffStats } from '@/lib/statsUtils';
import type { User } from '@/types';

export default function AdminStaffPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ role: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (filters.role) params.role = filters.role;
      else params.roles = 'STAFF,CHEF,MAINTENANCE,MANAGER';
      const [staffRes, statsRes] = await Promise.all([userService.getStaffList(params), staffService.getStats()]);
      const d = staffRes.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
      setStats(parseStaffStats(statsRes.data?.data || {}));
    } catch { setData([]); }
    setLoading(false);
  }, [page, search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<User>[] = [
    { key: 'firstName', header: 'Staff Member', render: (_, r) => <UserInfoCell firstName={r.firstName} lastName={r.lastName} email={r.email} /> },
    { key: 'role', header: 'Role', render: (_, r) => <span className="text-xs px-2 py-0.5 rounded-full bg-[#60a5fa]/15 text-[#60a5fa]">{r.role}</span> },
    { key: 'staffProfile', header: 'Department', render: (_, r) => <span className="text-white/60 text-sm">{r.staffProfile?.department || '—'}</span> },
    { key: 'staffProfile', header: 'Designation', render: (_, r) => <span className="text-white/60 text-sm">{r.staffProfile?.designation || '—'}</span> },
    { key: 'staffProfile', header: 'Shift', render: (_, r) => <span className="text-white/50 text-xs">{r.staffProfile?.shift || '—'}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    { key: 'staffProfile', header: 'On Duty', render: (_, r) => <span className={`text-xs px-2 py-0.5 rounded-full ${r.staffProfile?.isOnDuty ? 'bg-[#37EFD1]/15 text-[#37EFD1]' : 'bg-white/5 text-white/30'}`}>{r.staffProfile?.isOnDuty ? 'On Duty' : 'Off'}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl text-white font-semibold">Staff</h1><p className="text-white/35 text-sm font-sans mt-0.5">Manage all staff members</p></div>
        <button className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white text-sm font-sans font-medium px-4 py-2 rounded-lg transition-all"><Plus className="h-4 w-4" />Add Staff</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Staff" value={stats.total || 0} icon={Users} color="#37EFD1" />
        <StatsCard title="On Duty" value={stats.onDuty || 0} icon={CheckSquare} color="#60a5fa" />
        <StatsCard title="Managers" value={stats.managers || 0} icon={Users} color="#a78bfa" />
        <StatsCard title="Chefs" value={stats.chefs || 0} icon={Users} color="#fb923c" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <DataTableSearch value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search staff..." />
          <DataTableFilters
            filters={[{ key: 'role', label: 'All Roles', options: [{ label: 'Manager', value: 'MANAGER' }, { label: 'Staff', value: 'STAFF' }, { label: 'Chef', value: 'CHEF' }, { label: 'Maintenance', value: 'MAINTENANCE' }] }]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ role: '' }); setPage(1); }} />
        </div>
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
