'use client';
import { useState, useEffect, useCallback } from 'react';
import { ChefHat, Loader2 } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableSearch from '@/components/shared/table/DataTableSearch';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { foodService } from '@/service/food.service';
import type { FoodOrder } from '@/types';

export default function AdminFoodPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<FoodOrder[]>([]);
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
      const [ordRes, statsRes] = await Promise.all([foodService.getOrders(params), foodService.getStats()]);
      const d = ordRes.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
      const rawStats = statsRes.data?.data || {};
      // byStatus: [{status:'PENDING', _count:{status:5}}, ...]
      const byStatus: Record<string,number> = {};
      for (const s of (rawStats.byStatus || []) as Array<Record<string,unknown>>) {
        const k = String(s.status || '').toLowerCase();
        byStatus[k] = Number((s._count as Record<string,unknown>)?.status ?? 0);
      }
      setStats({
        total:     Object.values(byStatus).reduce((a,b) => a+b, 0),
        pending:   byStatus['pending']   || 0,
        preparing: byStatus['preparing'] || 0,
        delivered: byStatus['delivered'] || 0,
        confirmed: byStatus['confirmed'] || 0,
      });
    } catch { setData([]); }
    setLoading(false);
  }, [page, search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try { await foodService.updateOrderStatus(id, status); await fetchData(); } catch {}
    setActionLoading(null);
  };

  const columns: Column<FoodOrder>[] = [
    { key: 'orderNumber', header: 'Order #', render: (_, r) => <span className="text-[#37EFD1] text-xs font-mono">{r.orderNumber}</span> },
    { key: 'type', header: 'Type', render: (_, r) => <span className="text-white/60 text-xs">{r.type.replace('_', ' ')}</span> },
    { key: 'roomNumber', header: 'Room/Table', render: (_, r) => <span className="text-white/60 text-sm">{r.roomNumber || r.tableNumber || '—'}</span> },
    { key: 'totalAmount', header: 'Total', render: (_, r) => <span className="text-white font-medium">RM {Number(r.totalAmount).toFixed(2)}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    { key: 'createdAt', header: 'Ordered', render: (_, r) => <DateCell date={r.createdAt} /> },
    {
      key: 'id', header: 'Actions', render: (_, r) => (
        <div className="flex gap-1">
          {r.status === 'PENDING' && <button onClick={() => updateStatus(r.id, 'CONFIRMED')} disabled={!!actionLoading} className="text-[9px] px-2 py-0.5 rounded border border-[#37EFD1]/30 text-[#37EFD1] hover:bg-[#37EFD1]/10 transition-all">{actionLoading === r.id ? '...' : 'Confirm'}</button>}
          {r.status === 'CONFIRMED' && <button onClick={() => updateStatus(r.id, 'PREPARING')} disabled={!!actionLoading} className="text-[9px] px-2 py-0.5 rounded border border-[#60a5fa]/30 text-[#60a5fa] hover:bg-[#60a5fa]/10 transition-all">{actionLoading === r.id ? '...' : 'Prepare'}</button>}
          {r.status === 'PREPARING' && <button onClick={() => updateStatus(r.id, 'READY')} disabled={!!actionLoading} className="text-[9px] px-2 py-0.5 rounded border border-[#a78bfa]/30 text-[#a78bfa] hover:bg-[#a78bfa]/10 transition-all">{actionLoading === r.id ? '...' : 'Ready'}</button>}
          {r.status === 'READY' && <button onClick={() => updateStatus(r.id, 'DELIVERED')} disabled={!!actionLoading} className="text-[9px] px-2 py-0.5 rounded border border-white/20 text-white/60 hover:text-white transition-all">{actionLoading === r.id ? '...' : 'Deliver'}</button>}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">Food & Orders</h1><p className="text-white/35 text-sm font-sans mt-0.5">Manage restaurant orders and food service</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Orders" value={stats.total || 0} icon={ChefHat} color="#37EFD1" />
        <StatsCard title="Pending" value={stats.pending || 0} icon={ChefHat} color="#fb923c" />
        <StatsCard title="Preparing" value={stats.preparing || 0} icon={ChefHat} color="#60a5fa" />
        <StatsCard title="Delivered" value={stats.delivered || 0} icon={ChefHat} color="#a78bfa" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <DataTableSearch value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search orders..." />
          <DataTableFilters filters={[{ key: 'status', label: 'All Statuses', options: [{ label: 'Pending', value: 'PENDING' }, { label: 'Confirmed', value: 'CONFIRMED' }, { label: 'Preparing', value: 'PREPARING' }, { label: 'Ready', value: 'READY' }, { label: 'Delivered', value: 'DELIVERED' }] }]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ status: '' }); setPage(1); }} />
        </div>
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
