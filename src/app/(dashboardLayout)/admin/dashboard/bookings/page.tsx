'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { parseBookingStats } from '@/lib/statsUtils';
import type { Booking } from '@/types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const bookingKeys = {
  all:   (params: Record<string, unknown>) => ['bookings', 'list', params] as const,
  stats: () => ['bookings', 'stats'] as const,
};

const LIMIT = 10;

// ─── Response helpers ─────────────────────────────────────────────────────────
interface BookingListResponse {
  data?: { data?: Booking[] | { data: Booking[]; total: number }; total?: number };
}

function extractBookings(res: BookingListResponse | undefined): Booking[] {
  const d = res?.data?.data;
  if (!d) return [];
  if (Array.isArray(d)) return d;
  return (d as { data: Booking[]; total: number }).data ?? [];
}

function extractTotal(res: BookingListResponse | undefined): number {
  const d = res?.data?.data;
  if (!d) return 0;
  if (Array.isArray(d)) return res?.data?.total ?? 0;
  return (d as { data: Booking[]; total: number }).total ?? 0;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminBookingsPage() {
  const queryClient = useQueryClient();

  const [search,  setSearch]  = useState('');
  const [filters, setFilters] = useState({ status: '' });
  const [page,    setPage]    = useState(1);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  // ── Params ──────────────────────────────────────────────────────────────────
  const params: Record<string, unknown> = { page, limit: LIMIT };
  if (search)         params.search = search;
  if (filters.status) params.status = filters.status;

  const currentKey = bookingKeys.all(params);

  // ── Bookings list ────────────────────────────────────────────────────────────
  const { data: bookingRes, isLoading } = useQuery({
    queryKey: currentKey,
    queryFn:  () => bookingService.getAll(params),
    placeholderData: (prev) => prev,
  });

  // ── Stats ────────────────────────────────────────────────────────────────────
  const { data: statsRes } = useQuery({
    queryKey: bookingKeys.stats(),
    queryFn:  () => bookingService.getStats(),
  });

  // ── Action mutation ──────────────────────────────────────────────────────────
  const { mutate: doAction } = useMutation({
    mutationFn: ({ action, id }: { action: string; id: string }) => {
      if (action === 'confirm')  return bookingService.confirm(id);
      if (action === 'checkin')  return bookingService.checkIn(id);
      if (action === 'checkout') return bookingService.checkOut(id);
      return bookingService.cancel(id);
    },
    onMutate: ({ action, id }) => setPendingKey(id + action),
    onSettled: () => {
      setPendingKey(null);
      queryClient.invalidateQueries({ queryKey: currentKey });
      queryClient.invalidateQueries({ queryKey: bookingKeys.stats() });
    },
  });

  // ── Derived data ─────────────────────────────────────────────────────────────
  const bookings = extractBookings(bookingRes);
  const total    = extractTotal(bookingRes);
  const rawStats = statsRes?.data?.data ?? {};
  const stats    = parseBookingStats(rawStats);

  // ── Columns ───────────────────────────────────────────────────────────────────
  const columns: Column<Booking>[] = [
    {
      key: 'bookingNumber', header: 'Booking ID',
      render: (_, r) => <span className="text-[#37EFD1] text-xs font-mono">{r.bookingNumber}</span>,
    },
    {
      key: 'customer', header: 'Guest',
      render: (_, r) => r.customer
        ? <UserInfoCell firstName={r.customer.firstName} lastName={r.customer.lastName} email={r.customer.email} />
        : <span className="text-white/40 text-xs">—</span>,
    },
    {
      key: 'room', header: 'Room',
      render: (_, r) => <span className="text-white/70 text-sm">{r.room?.roomNumber || '—'}</span>,
    },
    { key: 'checkInDate',  header: 'Check In',  render: (_, r) => <DateCell date={r.checkInDate} /> },
    { key: 'checkOutDate', header: 'Check Out', render: (_, r) => <DateCell date={r.checkOutDate} /> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    {
      key: 'totalAmount', header: 'Amount',
      render: (_, r) => <span className="text-white font-medium">RM {Number(r.totalAmount).toLocaleString()}</span>,
    },
    {
      key: 'id', header: 'Actions',
      render: (_, r) => {
        const busy = !!pendingKey;
        const spin = (action: string) => pendingKey === r.id + action;
        return (
          <div className="flex items-center gap-1">
            {r.status === 'PENDING' && (
              <button onClick={() => doAction({ action: 'confirm', id: r.id })} disabled={busy}
                className="p-1.5 rounded text-[#37EFD1] hover:bg-[#37EFD1]/10 transition-colors disabled:opacity-50" title="Confirm">
                {spin('confirm') ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
              </button>
            )}
            {r.status === 'CONFIRMED' && (
              <button onClick={() => doAction({ action: 'checkin', id: r.id })} disabled={busy}
                className="p-1.5 rounded text-[#60a5fa] hover:bg-[#60a5fa]/10 transition-colors disabled:opacity-50" title="Check In">
                {spin('checkin') ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogIn className="h-3.5 w-3.5" />}
              </button>
            )}
            {r.status === 'CHECKED_IN' && (
              <button onClick={() => doAction({ action: 'checkout', id: r.id })} disabled={busy}
                className="p-1.5 rounded text-[#fb923c] hover:bg-[#fb923c]/10 transition-colors disabled:opacity-50" title="Check Out">
                {spin('checkout') ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
              </button>
            )}
            <button className="p-1.5 rounded text-white/30 hover:text-white hover:bg-white/5 transition-colors" title="View">
              <Eye className="h-3.5 w-3.5" />
            </button>
            {!['CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].includes(r.status) && (
              <button onClick={() => doAction({ action: 'cancel', id: r.id })} disabled={busy}
                className="p-1.5 rounded text-[#C8102E] hover:bg-[#C8102E]/10 transition-colors disabled:opacity-50" title="Cancel">
                {spin('cancel') ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-white font-semibold">Bookings</h1>
        <p className="text-white/35 text-sm font-sans mt-0.5">Manage all guest reservations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Bookings" value={stats.total    ?? 0} icon={Calendar}     color="#37EFD1" />
        <StatsCard title="Confirmed"      value={stats.confirmed ?? 0} icon={CheckCircle} color="#60a5fa" />
        <StatsCard title="Checked In"     value={stats.checkedIn ?? 0} icon={LogIn}       color="#37EFD1" />
        <StatsCard title="Pending"        value={stats.pending   ?? 0} icon={Calendar}    color="#fb923c" />
      </div>

      {/* Table */}
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <DataTableSearch
            value={search}
            onChange={v => { setSearch(v); setPage(1); }}
            placeholder="Search by guest or booking ID..."
          />
          <DataTableFilters
            filters={[{
              key: 'status', label: 'All Statuses',
              options: [
                { label: 'Confirmed',   value: 'CONFIRMED'   },
                { label: 'Pending',     value: 'PENDING'     },
                { label: 'Checked In',  value: 'CHECKED_IN'  },
                { label: 'Checked Out', value: 'CHECKED_OUT' },
                { label: 'Cancelled',   value: 'CANCELLED'   },
              ],
            }]}
            values={filters}
            onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }}
            onReset={() => { setFilters({ status: '' }); setPage(1); }}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/30" />
          </div>
        ) : (
          <>
            <DataTable data={bookings} columns={columns} />
            <DataTablePagination
              page={page}
              totalPages={Math.ceil(total / LIMIT)}
              onPage={setPage}
              total={total}
              limit={LIMIT}
            />
          </>
        )}
      </div>
    </div>
  );
}