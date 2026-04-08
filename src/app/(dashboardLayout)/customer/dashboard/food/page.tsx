'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChefHat, Loader2, XCircle } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { foodService } from '@/service/food.service';
import type { FoodOrder } from '@/types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const foodKeys = {
  all:   (params: Record<string, unknown>) => ['food', 'orders', params] as const,
  stats: () => ['food', 'stats'] as const,
};

const LIMIT = 10;

// ─── Response helpers ─────────────────────────────────────────────────────────
interface FoodListResponse {
  data?: { data?: FoodOrder[] | { data: FoodOrder[]; total: number }; total?: number };
}

function extractOrders(res: FoodListResponse | undefined): FoodOrder[] {
  const d = res?.data?.data;
  if (!d) return [];
  if (Array.isArray(d)) return d;
  return (d as { data: FoodOrder[]; total: number }).data ?? [];
}

function extractTotal(res: FoodListResponse | undefined): number {
  const d = res?.data?.data;
  if (!d) return 0;
  if (Array.isArray(d)) return res?.data?.total ?? 0;
  return (d as { data: FoodOrder[]; total: number }).total ?? 0;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CustomerFoodPage() {
  const queryClient = useQueryClient();

  const [filters,   setFilters]   = useState({ status: '' });
  const [page,      setPage]      = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);

  // ── Params ───────────────────────────────────────────────────────────────────
  const params: Record<string, unknown> = { page, limit: LIMIT };
  if (filters.status) params.status = filters.status;

  const currentKey = foodKeys.all(params);

  // ── Orders list ───────────────────────────────────────────────────────────────
  const { data: orderRes, isLoading } = useQuery({
    queryKey: currentKey,
    queryFn:  () => foodService.getOrders(params),
    placeholderData: (prev) => prev,
  });

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const { data: statsRes } = useQuery({
    queryKey: foodKeys.stats(),
    queryFn:  () => foodService.getStats(),
  });

  // ── Cancel mutation ───────────────────────────────────────────────────────────
  const { mutate: cancelOrder } = useMutation({
    mutationFn: (id: string) => foodService.cancelOrder(id),

    onMutate: async (id) => {
      setPendingId(id);
      await queryClient.cancelQueries({ queryKey: currentKey });
      const previous = queryClient.getQueryData(currentKey);

      // Optimistically mark as CANCELLED
      queryClient.setQueryData(currentKey, (old: FoodListResponse | undefined) => {
        if (!old) return old;
        const patch = (o: FoodOrder) => o.id === id ? { ...o, status: 'CANCELLED' } : o;
        const d = old.data?.data;
        if (!d) return old;
        const patched = Array.isArray(d)
          ? d.map(patch)
          : { ...(d as { data: FoodOrder[]; total: number }), data: (d as { data: FoodOrder[]; total: number }).data.map(patch) };
        return { ...old, data: { ...old.data, data: patched } };
      });

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined)
        queryClient.setQueryData(currentKey, context.previous);
    },

    onSettled: () => {
      setPendingId(null);
      queryClient.invalidateQueries({ queryKey: currentKey });
      queryClient.invalidateQueries({ queryKey: foodKeys.stats() });
    },
  });

  // ── Derived data ──────────────────────────────────────────────────────────────
  const orders    = extractOrders(orderRes);
  const total     = extractTotal(orderRes);
  const rawStats  = statsRes?.data?.data ?? {};

  const statCards = [
    { title: 'Total Orders', value: rawStats.total     ?? total,                                                                               color: '#37EFD1' },
    { title: 'Active',       value: rawStats.active    ?? orders.filter(o => ['CONFIRMED', 'PREPARING', 'READY'].includes(o.status)).length,   color: '#60a5fa' },
    { title: 'Delivered',    value: rawStats.delivered ?? orders.filter(o => o.status === 'DELIVERED').length,                                 color: '#a78bfa' },
    { title: 'Cancelled',    value: rawStats.cancelled ?? orders.filter(o => o.status === 'CANCELLED').length,                                 color: '#fb923c' },
  ] as const;

  // ── Columns ───────────────────────────────────────────────────────────────────
  const columns: Column<FoodOrder>[] = [
    {
      key: 'orderNumber', header: 'Order #',
      render: (_, r) => <span className="text-[#37EFD1] text-xs font-mono">{r.orderNumber}</span>,
    },
    {
      key: 'type', header: 'Type',
      render: (_, r) => <span className="text-white/60 text-xs">{r.type.replace('_', ' ')}</span>,
    },
    {
      key: 'totalAmount', header: 'Total',
      render: (_, r) => <span className="text-white font-medium">RM {Number(r.totalAmount).toFixed(2)}</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (_, r) => <StatusBadgeCell status={r.status} />,
    },
    {
      key: 'createdAt', header: 'Ordered',
      render: (_, r) => <DateCell date={r.createdAt} />,
    },
    {
      key: 'id', header: 'Actions',
      render: (_, r) => (
        <div className="flex gap-1">
          {['PENDING', 'CONFIRMED'].includes(r.status) && (
            <button
              onClick={() => cancelOrder(r.id)}
              disabled={!!pendingId}
              className="p-1.5 rounded text-[#C8102E] hover:bg-[#C8102E]/10 transition-colors disabled:opacity-50"
            >
              {pendingId === r.id
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <XCircle className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-white font-semibold">Food Orders</h1>
        <p className="text-white/35 text-sm font-sans mt-0.5">Your restaurant orders and room service</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, color }) => (
          <StatsCard key={title} title={title} value={value} icon={ChefHat} color={color} />
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <DataTableFilters
            filters={[{
              key: 'status', label: 'All Statuses',
              options: [
                { label: 'Pending',   value: 'PENDING'   },
                { label: 'Preparing', value: 'PREPARING' },
                { label: 'Delivered', value: 'DELIVERED' },
              ],
            }]}
            values={filters}
            onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }}
            onReset={() => { setFilters({ status: '' }); setPage(1); }}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/30" />
          </div>
        ) : (
          <>
            <DataTable data={orders} columns={columns} />
            <DataTablePagination
              page={page}
              totalPages={Math.ceil(total / LIMIT)}
              onPage={setPage}
              total={total}
              limit={LIMIT}
            />
          </>
        )}
      </div>
    </div>
  );
}