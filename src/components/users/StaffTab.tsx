'use client';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, Plus, Users, CheckSquare, Eye } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import UserInfoCell from '@/components/shared/cell/UserInfoCell';
import StatsCard from '@/components/shared/StatsCard';
import StaffActions from '@/components/users/StaffActions';
import StaffTableToolbar, { RoleFilter } from '@/components/SearchAndFilter/UserSearchFIlter';
import StaffViewSlideOver from '@/components/staff/StaffViewSlideOver';
import CreateStaffSlideOver from '@/components/staff/CreateStaffSlideOver';
import { userService } from '@/service/user.service';
import { parseStaffStats } from '@/lib/statsUtils';
import type { User } from '@/types';

export default function StaffTab({ isAdmin }: { isAdmin: boolean }) {
  const [search, setSearch]               = useState('');
  const [role, setRole]                   = useState<RoleFilter>('');
  const [page, setPage]                   = useState(1);
  const [data, setData]                   = useState<User[]>([]);
  const [total, setTotal]                 = useState(0);
  const [stats, setStats]                 = useState<Record<string, number>>({});
  const [loading, setLoading]             = useState(true);
  const [isCreateOpen, setIsCreateOpen]   = useState(false);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [selectedUser, setSelectedUser]   = useState<User | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (role) params.role = role;

      const requests: [Promise<any>, Promise<any>?] = [userService.getStaffList(params)];
      if (isAdmin) requests.push(userService.getStats());

      const [staffRes, statsRes] = await Promise.all(requests);
      const d = staffRes.data?.data;
      const allData: User[] = d?.data || d || [];

      // ✅ MANAGER হলে ADMIN আর MANAGER hide করো
      const filtered = !isAdmin
        ? allData.filter(u => !['ADMIN', 'MANAGER'].includes(u.role))
        : allData;

      setData(filtered);
      setTotal(d?.total || 0);
      if (isAdmin && statsRes) setStats(parseStaffStats(statsRes.data?.data || {}));
    } catch { setData([]); }
    setLoading(false);
  }, [page, search, role, isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleView = (user: User) => { setSelectedUser(user); setIsSlideOverOpen(true); };

  const columns: Column<User>[] = [
    { key: 'firstName', header: 'Staff Member', render: (_, r) => <UserInfoCell firstName={r.firstName} lastName={r.lastName} email={r.email} /> },
    { key: 'role',      header: 'Role',         render: (_, r) => <span className="text-xs px-2 py-0.5 rounded-full bg-[#60a5fa]/15 text-[#60a5fa]">{r.role}</span> },
    { key: 'status',    header: 'Status',       render: (_, r) => <StatusBadgeCell status={r.status} /> },
    {
      key: 'id', header: 'Actions',
      render: (_, r) => isAdmin
        // ✅ ADMIN — full actions
        ? <StaffActions user={r} isAdmin={isAdmin} onRefresh={fetchData} onView={handleView} />
        // ✅ MANAGER — শুধু view
        : (
          <button onClick={() => handleView(r)}
            className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all">
            <Eye className="h-3.5 w-3.5" />
          </button>
        ),
    },
  ];

  return (
    <>
      {/* ✅ Stats শুধু ADMIN */}
      {isAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Staff" value={stats.total  || 0} icon={Users}       color="#37EFD1" />
          <StatsCard title="On Duty"     value={stats.onDuty || 0} icon={CheckSquare} color="#60a5fa" />
        </div>
      )}

      
      <div className="flex justify-end">
          <button onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg transition-all text-sm">
            <Plus className="h-4 w-4" /> Add Staff
          </button>
        </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <StaffTableToolbar
          search={search} onSearchChange={v => { setSearch(v); setPage(1); }}
          role={role}     onRoleChange={v => { setRole(v); setPage(1); }}
          onReset={() => { setSearch(''); setRole(''); setPage(1); }}
        />
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/30" />
          </div>
        ) : (
          <>
            <DataTable data={data} columns={columns} />
            <DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} />
          </>
        )}
      </div>

      <StaffViewSlideOver isOpen={isSlideOverOpen} onClose={() => setIsSlideOverOpen(false)} user={selectedUser} />

     <CreateStaffSlideOver
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => { fetchData(); setIsCreateOpen(false); }}
        />
    </>
  );
}