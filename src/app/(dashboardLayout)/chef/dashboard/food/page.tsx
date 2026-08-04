"use client";
import { useState } from "react";
import { ChefHat, UtensilsCrossed, LayoutGrid } from "lucide-react";
import { OrdersPanel } from "@/components/food/Orderspanel";
import { MenuItemsPanel } from "@/components/food/Menuitemspanel";
import { CategoriesPanel } from "@/components/food/Categoriespanel";
import { Tab } from "@/types";
const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "orders", label: "Orders", icon: <ChefHat className="h-3.5 w-3.5" /> },
  { key: "items", label: "Menu Items", icon: <UtensilsCrossed className="h-3.5 w-3.5" /> },
];

export default function AdminFoodPage() {
  const [tab, setTab] = useState<Tab>("orders");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white font-semibold">Food & Orders</h1>
        <p className="text-white/35 text-sm font-sans mt-0.5">
          Manage restaurant orders, menu items and categories
        </p>
      </div>

      <div className="flex gap-1 bg-[#1A1B21] border border-white/5 rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-[#37EFD1]/10 text-[#37EFD1] border border-[#37EFD1]/20"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "orders" && <OrdersPanel />}
      {tab === "items" && <MenuItemsPanel />}
    </div>
  );
}