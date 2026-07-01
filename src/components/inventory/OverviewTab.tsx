'use client';
import { useQuery } from '@tanstack/react-query';
import { Package, AlertTriangle, Layers, TrendingDown, Loader2 } from 'lucide-react';
import StatsCard from '@/components/shared/StatsCard';
import { inventoryService } from '@/service/inventory.service';
import StockStatusBadge from './StockStatusBadge';
import { InventoryItem } from '@/types/inventoryTypes';

export default function OverviewTab() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: async () => {
      const r = await inventoryService.getStats();
      return r.data?.data;
    },
  });

  const { data: lowStock, isLoading: lowLoading } = useQuery({
    queryKey: ['inventory-low-stock'],
    queryFn: async () => {
      const r = await inventoryService.getLowStock();
      return (r.data?.data ?? []) as InventoryItem[];
    },
  });

  if (statsLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Items"     value={stats?.total ?? 0}           icon={Package}       color="#37EFD1" />
        <StatsCard title="Low Stock"       value={stats?.lowStockAlerts ?? 0}  icon={AlertTriangle} color="#F59E0B" />
        <StatsCard title="Categories"      value={stats?.categories ?? 0}      icon={Layers}        color="#60a5fa" />
        <StatsCard title="Total Stock Units" value={stats?.totalStockUnits ?? 0} icon={TrendingDown} color="#C8102E" />
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <h2 className="text-white font-display text-base font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-400" /> Low Stock Alerts
        </h2>
        {lowLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-white/30" /></div>
        ) : lowStock?.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">All items are sufficiently stocked</p>
        ) : (
          <div className="space-y-2">
            {lowStock?.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-[#0B0C10] border border-white/5 rounded-lg p-3">
                <div>
                  <p className="text-white text-sm font-sans">{item.name}</p>
                  <p className="text-white/40 text-xs font-sans">{item.sku} · {item.category?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/60 text-xs font-sans">{item.currentStock} / {item.minimumStock} {item.unit}</span>
                  <StockStatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}