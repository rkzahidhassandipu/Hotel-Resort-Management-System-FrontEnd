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

export default function ManagerFoodPage() {
  const [filters, setFilters] = useState({ status: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<FoodOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (filters.status) params.status = filters.status;
      const [ordRes, statsRes] = await Promise.all([foodService.getOrders(params), foodService.getStats()]);
      const d = ordRes.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
      const rawFS = statsRes.data?.data || {};
      const byStatusF: Record<string,number> = {};
      for (const s of (rawFS.byStatus || []) as Array<Record<string,unknown>>) {
        const k = String(s.status || '').toLowerCase();
        byStatusF[k] = Number((s._count as Record<string,unknown>)?.status ?? 0);
      }
      setStats({
        total:   Object.values(byStatusF).reduce((a,b) => a+b, 0),
        today:   byStatusF['pending'] + byStatusF['confirmed'] + byStatusF['preparing'] || 0,
        revenue: Number(rawFS.todayRevenue || 0),
        avgOrder:0,
      });
    } catch { setData([]); }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<FoodOrder>[] = [
    { key: 'orderNumber', header: 'Order #', render: (_, r) => <span className="text-[#37EFD1] text-xs font-mono">{r.orderNumber}</span> },
    { key: 'type', header: 'Type', render: (_, r) => <span className="text-white/60 text-xs">{r.type.replace('_', ' ')}</span> },
    { key: 'roomNumber', header: 'Room/Table', render: (_, r) => <span className="text-white/60 text-sm">{r.roomNumber || r.tableNumber || '—'}</span> },
    { key: 'totalAmount', header: 'Total', render: (_, r) => <span className="text-white font-medium">RM {Number(r.totalAmount).toFixed(2)}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    { key: 'createdAt', header: 'Ordered', render: (_, r) => <DateCell date={r.createdAt} /> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">Food & Orders</h1><p className="text-white/35 text-sm font-sans mt-0.5">Monitor restaurant orders</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Orders" value={stats.total || 0} icon={ChefHat} color="#37EFD1" />
        <StatsCard title="Today" value={stats.today || 0} icon={ChefHat} color="#60a5fa" />
        <StatsCard title="Revenue" value={`RM ${Number(stats.revenue || 0).toLocaleString()}`} icon={ChefHat} color="#a78bfa" />
        <StatsCard title="Avg Order" value={`RM ${Number(stats.avgOrder || 0).toFixed(0)}`} icon={ChefHat} color="#fb923c" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex gap-3 mb-4">
          <DataTableFilters filters={[{ key: 'status', label: 'All Statuses', options: [{ label: 'Pending', value: 'PENDING' }, { label: 'Preparing', value: 'PREPARING' }, { label: 'Delivered', value: 'DELIVERED' }] }]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ status: '' }); setPage(1); }} />
        </div>
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
