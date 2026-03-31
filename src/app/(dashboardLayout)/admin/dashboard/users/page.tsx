'use client';
import { useState, useEffect, useCallback } from 'react';
import { Users, UserCheck, UserX, Loader2, Trash2 } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableSearch from '@/components/shared/table/DataTableSearch';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import UserInfoCell from '@/components/shared/cell/UserInfoCell';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { userService } from '@/service/user.service';
import type { User } from '@/types';
import { parseUserStats } from '@/lib/statsUtils';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ role: '', status: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      const [usersRes, statsRes] = await Promise.all([userService.getAll(params), userService.getStats()]);
      const d = usersRes.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
      setStats(parseUserStats(statsRes.data?.data || {}));
    } catch { setData([]); }
    setLoading(false);
  }, [page, search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (id: string, status: string) => {
    setActionLoading(id + status);
    try { await userService.updateStatus(id, status); await fetchData(); } catch {}
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    setActionLoading(id + 'del');
    try { await userService.delete(id); await fetchData(); } catch {}
    setActionLoading(null);
  };

  const columns: Column<User>[] = [
    { key: 'firstName', header: 'User', render: (_, r) => <UserInfoCell firstName={r.firstName} lastName={r.lastName} email={r.email} /> },
    { key: 'role', header: 'Role', render: (_, r) => <span className="text-xs px-2 py-0.5 rounded-full bg-[#C8102E]/15 text-[#C8102E] font-sans">{r.role}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    { key: 'createdAt', header: 'Joined', render: (_, r) => <DateCell date={r.createdAt} /> },
    { key: 'lastLoginAt', header: 'Last Login', render: (_, r) => r.lastLoginAt ? <DateCell date={r.lastLoginAt} /> : <span className="text-white/25 text-xs">Never</span> },
    {
      key: 'id', header: 'Actions', render: (_, r) => (
        <div className="flex gap-1">
          {r.status === 'ACTIVE' && <button onClick={() => handleStatusChange(r.id, 'SUSPENDED')} disabled={!!actionLoading} className="text-[9px] px-2 py-0.5 rounded border border-[#fb923c]/30 text-[#fb923c] hover:bg-[#fb923c]/10 transition-all"><UserX className="h-3 w-3 inline mr-1" />Suspend</button>}
          {r.status !== 'ACTIVE' && <button onClick={() => handleStatusChange(r.id, 'ACTIVE')} disabled={!!actionLoading} className="text-[9px] px-2 py-0.5 rounded border border-[#37EFD1]/30 text-[#37EFD1] hover:bg-[#37EFD1]/10 transition-all"><UserCheck className="h-3 w-3 inline mr-1" />Activate</button>}
          <button onClick={() => handleDelete(r.id)} disabled={!!actionLoading} className="p-1 rounded text-[#C8102E]/60 hover:text-[#C8102E] hover:bg-[#C8102E]/10 transition-colors">{actionLoading === r.id + 'del' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}</button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">Users</h1><p className="text-white/35 text-sm font-sans mt-0.5">Manage all system users</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={stats.total || 0} icon={Users} color="#37EFD1" />
        <StatsCard title="Active" value={stats.active || 0} icon={UserCheck} color="#60a5fa" />
        <StatsCard title="Staff" value={stats.staff || 0} icon={Users} color="#a78bfa" />
        <StatsCard title="Customers" value={stats.customers || 0} icon={Users} color="#fb923c" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <DataTableSearch value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search users..." />
          <DataTableFilters
            filters={[
              { key: 'role', label: 'All Roles', options: [{ label: 'Admin', value: 'ADMIN' }, { label: 'Manager', value: 'MANAGER' }, { label: 'Staff', value: 'STAFF' }, { label: 'Customer', value: 'CUSTOMER' }, { label: 'Chef', value: 'CHEF' }, { label: 'Maintenance', value: 'MAINTENANCE' }] },
              { key: 'status', label: 'All Statuses', options: [{ label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' }, { label: 'Suspended', value: 'SUSPENDED' }] },
            ]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ role: '', status: '' }); setPage(1); }} />
        </div>
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
