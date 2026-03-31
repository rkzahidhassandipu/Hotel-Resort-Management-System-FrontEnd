'use client';
import { useState, useEffect, useCallback } from 'react';
import { Calendar, Loader2, XCircle } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableSearch from '@/components/shared/table/DataTableSearch';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { bookingService } from '@/service/booking.service';
import type { Booking } from '@/types';

export default function CustomerBookingsPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (filters.status) params.status = filters.status;
      const res = await bookingService.getAll(params);
      const d = res.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
    } catch { setData([]); }
    setLoading(false);
  }, [page, search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const cancelBooking = async (id: string) => {
    setActionLoading(id);
    try { await bookingService.cancel(id); await fetchData(); } catch {}
    setActionLoading(null);
  };

  const columns: Column<Booking>[] = [
    { key: 'bookingNumber', header: 'Booking #', render: (_, r) => <span className="text-[#37EFD1] text-xs font-mono">{r.bookingNumber}</span> },
    { key: 'room', header: 'Room', render: (_, r) => <span className="text-white/70 text-sm">{r.room?.roomNumber ? `Room #${r.room.roomNumber}` : '—'}</span> },
    { key: 'checkInDate', header: 'Check In', render: (_, r) => <DateCell date={r.checkInDate} /> },
    { key: 'checkOutDate', header: 'Check Out', render: (_, r) => <DateCell date={r.checkOutDate} /> },
    { key: 'nights', header: 'Nights', render: (_, r) => <span className="text-white/60 text-sm">{r.nights}</span> },
    { key: 'totalAmount', header: 'Total', render: (_, r) => <span className="text-white font-medium">RM {Number(r.totalAmount).toLocaleString()}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    {
      key: 'id', header: 'Actions', render: (_, r) => (
        <div className="flex gap-1">
          {!['CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].includes(r.status) && (
            <button onClick={() => cancelBooking(r.id)} disabled={!!actionLoading} className="p-1.5 rounded text-[#C8102E] hover:bg-[#C8102E]/10 transition-colors" title="Cancel">
              {actionLoading === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">My Bookings</h1><p className="text-white/35 text-sm font-sans mt-0.5">View and manage your reservations</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Bookings" value={total} icon={Calendar} color="#37EFD1" />
        <StatsCard title="Active" value={data.filter(b => ['CONFIRMED', 'CHECKED_IN'].includes(b.status)).length} icon={Calendar} color="#60a5fa" />
        <StatsCard title="Pending" value={data.filter(b => b.status === 'PENDING').length} icon={Calendar} color="#fb923c" />
        <StatsCard title="Completed" value={data.filter(b => b.status === 'CHECKED_OUT').length} icon={Calendar} color="#a78bfa" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <DataTableSearch value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search bookings..." />
          <DataTableFilters filters={[{ key: 'status', label: 'All Statuses', options: [{ label: 'Pending', value: 'PENDING' }, { label: 'Confirmed', value: 'CONFIRMED' }, { label: 'Checked In', value: 'CHECKED_IN' }, { label: 'Checked Out', value: 'CHECKED_OUT' }, { label: 'Cancelled', value: 'CANCELLED' }] }]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ status: '' }); setPage(1); }} />
        </div>
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
