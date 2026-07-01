'use client';
import { useState } from 'react';
import { Package, Layers, ShoppingCart, BarChart3 } from 'lucide-react';
import OverviewTab from '@/components/inventory/OverviewTab';
import ItemsTab from '@/components/inventory/ItemsTab';
import CategoriesTab from '@/components/inventory/CategoriesTab';
import ProcurementTab from '@/components/inventory/ProcurementTab';

type Tab = 'overview' | 'items' | 'categories' | 'procurement';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview',    label: 'Overview',    icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { key: 'items',       label: 'Items',       icon: <Package className="h-3.5 w-3.5" /> },
    { key: 'categories',  label: 'Categories',  icon: <Layers className="h-3.5 w-3.5" /> },
    { key: 'procurement', label: 'Procurement', icon: <ShoppingCart className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white font-semibold">Inventory</h1>
        <p className="text-white/35 text-sm font-sans mt-0.5">Manage stock, categories, and procurement</p>
      </div>

      <div className="flex gap-1 bg-white/5 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-sans transition-all ${
              activeTab === t.key ? 'bg-[#C8102E] text-white' : 'text-white/40 hover:text-white'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview'    && <OverviewTab />}
      {activeTab === 'items'       && <ItemsTab />}
      {activeTab === 'categories'  && <CategoriesTab />}
      {activeTab === 'procurement' && <ProcurementTab />}
    </div>
  );
}