'use client';
import { useState, useEffect, useCallback } from 'react';
import { Package, AlertTriangle, Loader2 } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableSearch from '@/components/shared/table/DataTableSearch';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import StatsCard from '@/components/shared/StatsCard';
import { inventoryService } from '@/service/inventory.service';
import type { InventoryItem } from '@/types';
import { parseInventoryStats } from '@/lib/statsUtils';

export default function AdminInventoryPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (filters.status) params.status = filters.status;
      const [invRes, statsRes] = await Promise.all([inventoryService.getAll(params), inventoryService.getStats()]);
      const d = invRes.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
      setStats(parseInventoryStats(statsRes.data?.data || {}));
    } catch { setData([]); }
    setLoading(false);
  }, [page, search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<InventoryItem>[] = [
    { key: 'name', header: 'Item', render: (_, r) => <span className="text-white text-sm">{r.name}</span> },
    { key: 'sku', header: 'SKU', render: (_, r) => <span className="text-white/40 text-xs font-mono">{r.sku}</span> },
    { key: 'category', header: 'Category', render: (_, r) => <span className="text-white/60 text-xs">{r.category?.name || '—'}</span> },
    { key: 'currentStock', header: 'Stock', render: (_, r) => <span className={`font-medium text-sm ${r.currentStock <= r.minimumStock ? 'text-[#C8102E]' : 'text-white'}`}>{r.currentStock} {r.unit}</span> },
    { key: 'minimumStock', header: 'Min Stock', render: (_, r) => <span className="text-white/40 text-xs">{r.minimumStock} {r.unit}</span> },
    { key: 'unitCost', header: 'Unit Cost', render: (_, r) => <span className="text-white/60 text-sm">RM {Number(r.unitCost).toFixed(2)}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    { key: 'supplier', header: 'Supplier', render: (_, r) => <span className="text-white/40 text-xs">{r.supplier || '—'}</span> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">Inventory</h1><p className="text-white/35 text-sm font-sans mt-0.5">Track and manage hotel inventory</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Items" value={stats.total || 0} icon={Package} color="#37EFD1" />
        <StatsCard title="Low Stock" value={stats.lowStock || 0} icon={AlertTriangle} color="#fb923c" />
        <StatsCard title="Out of Stock" value={stats.outOfStock || 0} icon={AlertTriangle} color="#C8102E" />
        <StatsCard title="Categories" value={stats.categories || 0} icon={Package} color="#a78bfa" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <DataTableSearch value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search inventory..." />
          <DataTableFilters
            filters={[{ key: 'status', label: 'All Statuses', options: [{ label: 'Sufficient', value: 'SUFFICIENT' }, { label: 'Low', value: 'LOW' }, { label: 'Out of Stock', value: 'OUT_OF_STOCK' }, { label: 'Overstocked', value: 'OVERSTOCKED' }] }]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ status: '' }); setPage(1); }} />
        </div>
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
