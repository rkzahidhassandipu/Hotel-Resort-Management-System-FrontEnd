'use client';
import { useState, useEffect, useCallback } from 'react';
import { BedDouble, Plus, Loader2 } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableSearch from '@/components/shared/table/DataTableSearch';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import StatsCard from '@/components/shared/StatsCard';
import { roomService } from '@/service/room.service';
import type { Room } from '@/types';

export default function AdminRoomsPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Room[]>([]);
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
      if (filters.type) params.type = filters.type;
      const [roomRes, statsRes] = await Promise.all([roomService.getAll(params), roomService.getStats()]);
      const d = roomRes.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
      setStats(statsRes.data?.data || {});
    } catch { setData([]); }
    setLoading(false);
  }, [page, search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (id: string, status: string) => {
    setActionLoading(id + status);
    try {
      await roomService.update(id, { status });
      await fetchData();
    } catch {}
    setActionLoading(null);
  };

  const statusOptions = ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE', 'OUT_OF_ORDER'];

  const columns: Column<Room>[] = [
    { key: 'roomNumber', header: 'Room No.', render: (_, r) => <span className="text-[#37EFD1] font-mono text-sm">#{r.roomNumber}</span> },
    { key: 'type', header: 'Type', render: (_, r) => <span className="text-white text-sm">{r.type}</span> },
    { key: 'floor', header: 'Floor', render: (_, r) => <span className="text-white/60 text-sm">Floor {r.floor}</span> },
    { key: 'maxOccupancy', header: 'Capacity', render: (_, r) => <span className="text-white/60 text-sm">{r.maxOccupancy} guests</span> },
    { key: 'category', header: 'Base Price', render: (_, r) => <span className="text-white font-medium text-sm">RM {Number(r.category?.basePrice || 0).toLocaleString()}/night</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    {
      key: 'id', header: 'Actions', render: (_, r) => (
        <div className="flex gap-1 flex-wrap">
          {statusOptions.filter(s => s !== r.status).map(s => (
            <button key={s} onClick={() => handleStatusChange(r.id, s)} disabled={!!actionLoading}
              className="text-[9px] font-sans px-2 py-0.5 rounded border border-white/10 text-white/40 hover:border-white/25 hover:text-white transition-all">
              {actionLoading === r.id + s ? '...' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl text-white font-semibold">Rooms</h1><p className="text-white/35 text-sm font-sans mt-0.5">Manage all hotel rooms</p></div>
        <button className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white text-sm font-sans font-medium px-4 py-2 rounded-lg transition-all"><Plus className="h-4 w-4" />Add Room</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[['Available', stats.available || 0, '#37EFD1'], ['Occupied', stats.occupied || 0, '#C8102E'], ['Cleaning', stats.cleaning || 0, '#a78bfa'], ['Maintenance', stats.maintenance || 0, '#fb923c']].map(([l, v, c]) =>
          <StatsCard key={l as string} title={l as string} value={v as number} icon={BedDouble} color={c as '#C8102E'} />
        )}
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <DataTableSearch value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by room number or type..." />
          <DataTableFilters
            filters={[
              { key: 'status', label: 'All Statuses', options: [{ label: 'Available', value: 'AVAILABLE' }, { label: 'Occupied', value: 'OCCUPIED' }, { label: 'Cleaning', value: 'CLEANING' }, { label: 'Maintenance', value: 'MAINTENANCE' }] },
              { key: 'type', label: 'All Types', options: [{ label: 'Suite', value: 'SUITE' }, { label: 'Deluxe', value: 'DELUXE' }, { label: 'Villa', value: 'VILLA' }, { label: 'Penthouse', value: 'PENTHOUSE' }] },
            ]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ status: '', type: '' }); setPage(1); }} />
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
