'use client';
import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableSearch from '@/components/shared/table/DataTableSearch';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import UserInfoCell from '@/components/shared/cell/UserInfoCell';
import DateCell from '@/components/shared/cell/DateCell';
import UserDetailDrawer from '@/components/users/UserDetailDrawer';
import CustomerActions from '@/components/users/CustomerActions';
import { userService } from '@/service/user.service';
import type { User } from '@/types';

export default function CustomersTab({ isAdmin }: { isAdmin: boolean }) {
  const [search, setSearch]   = useState('');
  const [filters, setFilters] = useState({ status: '' });
  const [page, setPage]       = useState(1);
  const [data, setData]       = useState<User[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<User | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10, role: 'CUSTOMER' };
      if (search) params.search = search;
      if (filters.status) params.status = filters.status;
      const res = await userService.getAll(params);
      const d = res.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
    } catch { setData([]); }
    setLoading(false);
  }, [page, search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<User>[] = [
    { key: 'firstName', header: 'User',       render: (_, r) => <UserInfoCell firstName={r.firstName} lastName={r.lastName} email={r.email} /> },
    { key: 'role',      header: 'Role',       render: (_, r) => <span className="text-xs px-2 py-0.5 rounded-full bg-[#C8102E]/15 text-[#C8102E] font-sans">{r.role}</span> },
    { key: 'status',    header: 'Status',     render: (_, r) => <StatusBadgeCell status={r.status} /> },
    { key: 'createdAt', header: 'Joined',     render: (_, r) => <DateCell date={r.createdAt} /> },
    { key: 'lastLoginAt', header: 'Last Login', render: (_, r) => r.lastLoginAt ? <DateCell date={r.lastLoginAt} /> : <span className="text-white/25 text-xs">Never</span> },
    { key: 'id', header: 'Actions', render: (_, r) => <CustomerActions isAdmin={isAdmin} user={r} onRefresh={fetchData} onView={setSelected} /> },
  ];

  return (
    <>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <DataTableSearch value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search customers..." />
          <DataTableFilters
            filters={[{ key: 'status', label: 'All Statuses', options: [
              { label: 'Active',    value: 'ACTIVE'    },
              { label: 'Inactive',  value: 'INACTIVE'  },
              { label: 'Suspended', value: 'SUSPENDED' },
            ]}]}
            values={filters}
            onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }}
            onReset={() => { setFilters({ status: '' }); setPage(1); }}
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>
        ) : (
          <>
            <DataTable data={data} columns={columns} />
            <DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} />
          </>
        )}
      </div>
      <UserDetailDrawer user={selected} open={!!selected} onClose={() => setSelected(null)} />
    </>
  );
}