'use client';
import { useState, useEffect, useCallback } from 'react';
import { ChefHat, Loader2, Plus } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableSearch from '@/components/shared/table/DataTableSearch';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatsCard from '@/components/shared/StatsCard';
import { foodService } from '@/service/food.service';
import type { MenuItem } from '@/types';

export default function ChefMenuPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<MenuItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await foodService.getMenu();
      const d = res.data?.data;
      let items: MenuItem[] = [];
      if (Array.isArray(d)) items = d.flatMap((cat: { menuItems?: MenuItem[] }) => cat.menuItems || []);
      else if (d?.items) items = d.items;
      else if (d?.data) items = d.data;
      const filtered = items.filter(i =>
        (!search || i.name.toLowerCase().includes(search.toLowerCase())) &&
        (!filters.category || i.foodCategory === filters.category)
      );
      setData(filtered.slice((page - 1) * 10, page * 10));
      setTotal(filtered.length);
    } catch { setData([]); }
    setLoading(false);
  }, [page, search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleAvail = async (id: string, isAvailable: boolean) => {
    setActionLoading(id);
    try { await foodService.patchMenuItem(id, { isAvailable: !isAvailable }); await fetchData(); } catch {}
    setActionLoading(null);
  };

  const columns: Column<MenuItem>[] = [
    { key: 'name', header: 'Item', render: (_, r) => <div><p className="text-white text-sm">{r.name}</p><p className="text-white/30 text-xs">{r.description?.slice(0, 50)}...</p></div> },
    { key: 'foodCategory', header: 'Category', render: (_, r) => <span className="text-white/60 text-xs">{r.foodCategory}</span> },
    { key: 'price', header: 'Price', render: (_, r) => <span className="text-white font-medium">RM {Number(r.price).toFixed(2)}</span> },
    { key: 'preparationTime', header: 'Prep Time', render: (_, r) => <span className="text-white/50 text-xs">{r.preparationTime ? `${r.preparationTime} min` : '—'}</span> },
    { key: 'isAvailable', header: 'Available', render: (_, r) => (
      <button onClick={() => toggleAvail(r.id, r.isAvailable)} disabled={!!actionLoading} className={`text-xs px-2 py-0.5 rounded-full transition-all ${r.isAvailable ? 'bg-[#37EFD1]/15 text-[#37EFD1]' : 'bg-white/5 text-white/30'}`}>
        {actionLoading === r.id ? '...' : r.isAvailable ? 'Available' : 'Unavailable'}
      </button>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl text-white font-semibold">Menu</h1><p className="text-white/35 text-sm font-sans mt-0.5">Manage restaurant menu items</p></div>
        <button className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white text-sm font-sans font-medium px-4 py-2 rounded-lg transition-all"><Plus className="h-4 w-4" />Add Item</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Items" value={total} icon={ChefHat} color="#37EFD1" />
        <StatsCard title="Available" value={data.filter(i => i.isAvailable).length} icon={ChefHat} color="#60a5fa" />
        <StatsCard title="Vegetarian" value={data.filter(i => i.isVegetarian).length} icon={ChefHat} color="#a78bfa" />
        <StatsCard title="Unavailable" value={data.filter(i => !i.isAvailable).length} icon={ChefHat} color="#fb923c" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <DataTableSearch value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search menu items..." />
          <DataTableFilters filters={[{ key: 'category', label: 'All Categories', options: [{ label: 'Breakfast', value: 'BREAKFAST' }, { label: 'Lunch', value: 'LUNCH' }, { label: 'Dinner', value: 'DINNER' }, { label: 'Snacks', value: 'SNACKS' }, { label: 'Beverages', value: 'BEVERAGES' }] }]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ category: '' }); setPage(1); }} />
        </div>
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
