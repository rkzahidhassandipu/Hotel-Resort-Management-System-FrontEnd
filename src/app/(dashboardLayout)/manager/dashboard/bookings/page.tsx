'use client';
import { useState, useEffect, useCallback } from 'react';
import { Calendar, CheckCircle, LogIn, LogOut, Loader2 } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableSearch from '@/components/shared/table/DataTableSearch';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import UserInfoCell from '@/components/shared/cell/UserInfoCell';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { bookingService } from '@/service/booking.service';
import type { Booking } from '@/types';
import { parseBookingStats } from '@/lib/statsUtils';

export default function ManagerBookingsPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Booking[]>([]);
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
      const [bRes, sRes] = await Promise.all([bookingService.getAll(params), bookingService.getStats()]);
      const d = bRes.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
      setStats(parseBookingStats(sRes.data?.data || {}));
    } catch { setData([]); }
    setLoading(false);
  }, [page, search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (action: string, id: string) => {
    setActionLoading(id + action);
    try {
      if (action === 'confirm') await bookingService.confirm(id);
      if (action === 'checkin') await bookingService.checkIn(id);
      if (action === 'checkout') await bookingService.checkOut(id);
      await fetchData();
    } catch {}
    setActionLoading(null);
  };

  const columns: Column<Booking>[] = [
    { key: 'bookingNumber', header: 'Booking #', render: (_, r) => <span className="text-[#37EFD1] text-xs font-mono">{r.bookingNumber}</span> },
    { key: 'customer', header: 'Guest', render: (_, r) => r.customer ? <UserInfoCell firstName={r.customer.firstName} lastName={r.customer.lastName} email={r.customer.email} /> : <span className="text-white/40">—</span> },
    { key: 'room', header: 'Room', render: (_, r) => <span className="text-white/70 text-sm">{r.room?.roomNumber || '—'}</span> },
    { key: 'checkInDate', header: 'Check In', render: (_, r) => <DateCell date={r.checkInDate} /> },
    { key: 'totalAmount', header: 'Amount', render: (_, r) => <span className="text-white font-medium">RM {Number(r.totalAmount).toLocaleString()}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    {
      key: 'id', header: 'Actions', render: (_, r) => (
        <div className="flex gap-1">
          {r.status === 'PENDING' && <button onClick={() => handleAction('confirm', r.id)} disabled={!!actionLoading} className="p-1.5 rounded text-[#37EFD1] hover:bg-[#37EFD1]/10">{actionLoading === r.id + 'confirm' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}</button>}
          {r.status === 'CONFIRMED' && <button onClick={() => handleAction('checkin', r.id)} disabled={!!actionLoading} className="p-1.5 rounded text-[#60a5fa] hover:bg-[#60a5fa]/10">{actionLoading === r.id + 'checkin' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogIn className="h-3.5 w-3.5" />}</button>}
          {r.status === 'CHECKED_IN' && <button onClick={() => handleAction('checkout', r.id)} disabled={!!actionLoading} className="p-1.5 rounded text-[#fb923c] hover:bg-[#fb923c]/10">{actionLoading === r.id + 'checkout' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}</button>}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">Bookings</h1><p className="text-white/35 text-sm font-sans mt-0.5">Manage guest reservations</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total" value={stats.total || 0} icon={Calendar} color="#37EFD1" />
        <StatsCard title="Confirmed" value={stats.confirmed || 0} icon={CheckCircle} color="#60a5fa" />
        <StatsCard title="Checked In" value={stats.checkedIn || 0} icon={LogIn} color="#37EFD1" />
        <StatsCard title="Pending" value={stats.pending || 0} icon={Calendar} color="#fb923c" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <DataTableSearch value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search bookings..." />
          <DataTableFilters filters={[{ key: 'status', label: 'All Statuses', options: [{ label: 'Pending', value: 'PENDING' }, { label: 'Confirmed', value: 'CONFIRMED' }, { label: 'Checked In', value: 'CHECKED_IN' }] }]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ status: '' }); setPage(1); }} />
        </div>
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
