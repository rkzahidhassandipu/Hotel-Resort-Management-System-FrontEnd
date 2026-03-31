'use client';
import { useState, useEffect, useCallback } from 'react';
import { Calendar, CheckCircle, LogIn, LogOut, XCircle, Eye, Loader2 } from 'lucide-react';
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



export default function AdminBookingsPage() {
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
      const [bookRes, statsRes] = await Promise.all([
        bookingService.getAll(params),
        bookingService.getStats(),
      ]);
      const bookData = bookRes.data?.data;
      setData(bookData?.data || bookData || []);
      setTotal(bookData?.total || 0);
      const rawStats = statsRes.data?.data || {};
      setStats(parseBookingStats(rawStats));
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
      if (action === 'cancel') await bookingService.cancel(id);
      await fetchData();
    } catch {}
    setActionLoading(null);
  };

  const columns: Column<Booking>[] = [
    { key: 'bookingNumber', header: 'Booking ID', render: (_, r) => <span className="text-[#37EFD1] text-xs font-mono">{r.bookingNumber}</span> },
    { key: 'customer', header: 'Guest', render: (_, r) => r.customer ? <UserInfoCell firstName={r.customer.firstName} lastName={r.customer.lastName} email={r.customer.email} /> : <span className="text-white/40 text-xs">—</span> },
    { key: 'room', header: 'Room', render: (_, r) => <span className="text-white/70 text-sm">{r.room?.roomNumber || '—'}</span> },
    { key: 'checkInDate', header: 'Check In', render: (_, r) => <DateCell date={r.checkInDate} /> },
    { key: 'checkOutDate', header: 'Check Out', render: (_, r) => <DateCell date={r.checkOutDate} /> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    { key: 'totalAmount', header: 'Amount', render: (_, r) => <span className="text-white font-medium">RM {Number(r.totalAmount).toLocaleString()}</span> },
    {
      key: 'id', header: 'Actions', render: (_, r) => (
        <div className="flex items-center gap-1">
          {r.status === 'PENDING' && <button onClick={() => handleAction('confirm', r.id)} disabled={!!actionLoading} className="p-1.5 rounded text-[#37EFD1] hover:bg-[#37EFD1]/10 transition-colors" title="Confirm">{actionLoading === r.id + 'confirm' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}</button>}
          {r.status === 'CONFIRMED' && <button onClick={() => handleAction('checkin', r.id)} disabled={!!actionLoading} className="p-1.5 rounded text-[#60a5fa] hover:bg-[#60a5fa]/10 transition-colors" title="Check In">{actionLoading === r.id + 'checkin' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogIn className="h-3.5 w-3.5" />}</button>}
          {r.status === 'CHECKED_IN' && <button onClick={() => handleAction('checkout', r.id)} disabled={!!actionLoading} className="p-1.5 rounded text-[#fb923c] hover:bg-[#fb923c]/10 transition-colors" title="Check Out">{actionLoading === r.id + 'checkout' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}</button>}
          <button className="p-1.5 rounded text-white/30 hover:text-white hover:bg-white/5 transition-colors" title="View"><Eye className="h-3.5 w-3.5" /></button>
          {!['CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].includes(r.status) && <button onClick={() => handleAction('cancel', r.id)} disabled={!!actionLoading} className="p-1.5 rounded text-[#C8102E] hover:bg-[#C8102E]/10 transition-colors" title="Cancel">{actionLoading === r.id + 'cancel' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}</button>}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">Bookings</h1><p className="text-white/35 text-sm font-sans mt-0.5">Manage all guest reservations</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Bookings" value={stats.total || 0} icon={Calendar} color="#37EFD1" />
        <StatsCard title="Confirmed" value={stats.confirmed || 0} icon={CheckCircle} color="#60a5fa" />
        <StatsCard title="Checked In" value={stats.checkedIn || 0} icon={LogIn} color="#37EFD1" />
        <StatsCard title="Pending" value={stats.pending || 0} icon={Calendar} color="#fb923c" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <DataTableSearch value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by guest or booking ID..." />
          <DataTableFilters
            filters={[{ key: 'status', label: 'All Statuses', options: [{ label: 'Confirmed', value: 'CONFIRMED' }, { label: 'Pending', value: 'PENDING' }, { label: 'Checked In', value: 'CHECKED_IN' }, { label: 'Checked Out', value: 'CHECKED_OUT' }, { label: 'Cancelled', value: 'CANCELLED' }] }]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ status: '' }); setPage(1); }} />
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
    </div>
  );
}
