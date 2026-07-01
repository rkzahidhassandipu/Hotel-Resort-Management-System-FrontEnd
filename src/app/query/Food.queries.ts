import { useQuery } from "@tanstack/react-query";
import { foodService } from "@/service/food.service";
import { ByStatusEntry, FoodStats, MenuCategory } from "@/types";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const foodKeys = {
  all: ["food"] as const,
  orders: (p: Record<string, unknown>) => ["food", "orders", p] as const,
  stats: () => ["food", "stats"] as const,
  menu: () => ["food", "menu"] as const,
};

// ─── Stats parser ─────────────────────────────────────────────────────────────
export function parseStats(raw: Record<string, unknown>): FoodStats {
  const byStatus: Record<string, number> = {};
  for (const s of (raw.byStatus || []) as ByStatusEntry[]) {
    byStatus[String(s.status).toLowerCase()] = Number(s._count?.status ?? 0);
  }
  return {
    total: Object.values(byStatus).reduce((a, b) => a + b, 0),
    pending: byStatus["pending"] || 0,
    preparing: byStatus["preparing"] || 0,
    delivered: byStatus["delivered"] || 0,
    todayRevenue: Number((raw.todayRevenue as number | null) ?? 0),
  };
}

// ─── Shared hook ──────────────────────────────────────────────────────────────
export function useMenuQuery() {
  return useQuery<MenuCategory[]>({
    queryKey: foodKeys.menu(),
    queryFn: async () => {
      const res = await foodService.getMenu();
      const d = res.data?.data;
      if (Array.isArray(d)) return d as MenuCategory[];
      if (Array.isArray(d?.categories)) return d.categories as MenuCategory[];
      return [] as MenuCategory[];
    },
  });
}