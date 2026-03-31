'use client';
import { useState, useEffect, useCallback } from 'react';
import { ChefHat, Loader2 } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { foodService } from '@/service/food.service';
import type { FoodOrder } from '@/types';

export default function ChefOrdersPage() {
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
      if (filters.status) params.status = filters.status;
      const [ordRes, statsRes] = await Promise.all([foodService.getOrders(params), foodService.getStats()]);
      const d = ordRes.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
      const rawCS = statsRes.data?.data || {};
      const bySC: Record<string,number> = {};
      for (const s of (rawCS.byStatus || []) as Array<Record<string,unknown>>) {
        const k = String(s.status || '').toLowerCase();
        bySC[k] = Number((s._count as Record<string,unknown>)?.status ?? 0);
      }
      setStats({ today: bySC['confirmed']||0 + bySC['preparing']||0, pending: bySC['pending']||0, preparing: bySC['preparing']||0, ready: bySC['ready']||0 });
    } catch { setData([]); }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id + status);
    try { await foodService.updateOrderStatus(id, status); await fetchData(); } catch {}
    setActionLoading(null);
  };

  const columns: Column<FoodOrder>[] = [
    { key: 'orderNumber', header: 'Order #', render: (_, r) => <span className="text-[#37EFD1] text-xs font-mono">{r.orderNumber}</span> },
    { key: 'roomNumber', header: 'Room/Table', render: (_, r) => <span className="text-white text-sm">{r.roomNumber || r.tableNumber || '—'}</span> },
    { key: 'type', header: 'Type', render: (_, r) => <span className="text-white/50 text-xs">{r.type.replace('_', ' ')}</span> },
    { key: 'totalAmount', header: 'Total', render: (_, r) => <span className="text-white font-medium">RM {Number(r.totalAmount).toFixed(2)}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    { key: 'createdAt', header: 'Ordered', render: (_, r) => <DateCell date={r.createdAt} /> },
    {
      key: 'id', header: 'Update', render: (_, r) => (
        <div className="flex gap-1">
          {r.status === 'CONFIRMED' && <button onClick={() => updateStatus(r.id, 'PREPARING')} disabled={!!actionLoading} className="text-[9px] px-2 py-0.5 rounded border border-[#60a5fa]/30 text-[#60a5fa] hover:bg-[#60a5fa]/10">{actionLoading === r.id + 'PREPARING' ? '...' : 'Prepare'}</button>}
          {r.status === 'PREPARING' && <button onClick={() => updateStatus(r.id, 'READY')} disabled={!!actionLoading} className="text-[9px] px-2 py-0.5 rounded border border-[#37EFD1]/30 text-[#37EFD1] hover:bg-[#37EFD1]/10">{actionLoading === r.id + 'READY' ? '...' : 'Ready'}</button>}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">Kitchen Orders</h1><p className="text-white/35 text-sm font-sans mt-0.5">Manage incoming food orders</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Today" value={stats.today || 0} icon={ChefHat} color="#37EFD1" />
        <StatsCard title="Pending" value={stats.pending || 0} icon={ChefHat} color="#fb923c" />
        <StatsCard title="Preparing" value={stats.preparing || 0} icon={ChefHat} color="#60a5fa" />
        <StatsCard title="Ready" value={stats.ready || 0} icon={ChefHat} color="#a78bfa" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex gap-3 mb-4">
          <DataTableFilters filters={[{ key: 'status', label: 'All Statuses', options: [{ label: 'Confirmed', value: 'CONFIRMED' }, { label: 'Preparing', value: 'PREPARING' }, { label: 'Ready', value: 'READY' }, { label: 'Delivered', value: 'DELIVERED' }] }]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ status: '' }); setPage(1); }} />
        </div>
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
