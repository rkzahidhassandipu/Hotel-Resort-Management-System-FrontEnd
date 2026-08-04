"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChefHat, DollarSign, Eye } from "lucide-react";
import DataTable, { Column } from "@/components/shared/table/DataTable";
import DataTableSearch from "@/components/shared/table/DataTableSearch";
import DataTableFilters from "@/components/shared/table/DataTableFilters";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import DateCell from "@/components/shared/cell/DateCell";
import StatsCard from "@/components/shared/StatsCard";
import { foodService } from "@/service/food.service";
import type { FoodOrder } from "@/types";
import { foodKeys, parseStats } from "@/app/query/Food.queries";
import { ActionButton, Spinner } from "./Foodui";
import OrderDetailsSlideOver from "./OrderDetailsSlideOver";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function OrdersPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "" });
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<FoodOrder | null>(null);
  const { user } = useCurrentUser();
  const isManager = user?.role === "MANAGER";

  const orderParams: Record<string, unknown> = { page, limit: 10 };
  if (search) orderParams.search = search;
  if (filters.status) orderParams.status = filters.status;

  const { data: ordersData, isLoading } = useQuery({
    queryKey: foodKeys.orders(orderParams),
    queryFn: async () => {
      const res = await foodService.getOrders(orderParams);
      const d = res.data?.data;
      const orders = Array.isArray(d) ? d : d?.data || [];
      const total = res.data?.meta?.total ?? d?.total ?? orders.length;
      return { data: orders as FoodOrder[], total: total as number };
    },
    placeholderData: (prev) => prev,
  });

  const { data: stats = { total: 0, pending: 0, preparing: 0, delivered: 0, todayRevenue: 0 } } =
    useQuery({
      queryKey: foodKeys.stats(),
      queryFn: async () => {
        const res = await foodService.getStats();
        return parseStats((res.data?.data || {}) as Record<string, unknown>);
      },
      staleTime: 30_000,
    });

  const { mutate: updateStatus, variables: statusVars, isPending: isStatusPending } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      foodService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.orders(orderParams), exact: false });
      queryClient.invalidateQueries({ queryKey: foodKeys.stats() });
    },
  });

  const { mutate: cancelOrder, variables: cancelVars, isPending: isCancelPending } = useMutation({
    mutationFn: (id: string) => foodService.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.orders(orderParams), exact: false });
      queryClient.invalidateQueries({ queryKey: foodKeys.stats() });
    },
  });

  const columns: Column<FoodOrder>[] = [
    {
      key: "orderNumber",
      header: "Order #",
      render: (_, r) => (
        <span className="text-[#37EFD1] text-xs font-mono">{r.orderNumber}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (_, r) => (
        <span className="text-white/60 text-xs">{r.type.replace("_", " ")}</span>
      ),
    },
    {
      key: "roomNumber",
      header: "Room/Table",
      render: (_, r) => (
        <span className="text-white/60 text-sm">{r.roomNumber || r.tableNumber || "—"}</span>
      ),
    },
    {
      key: "totalAmount",
      header: "Total",
      render: (_, r) => (
        <span className="text-white font-medium">RM {Number(r.totalAmount).toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, r) => <StatusBadgeCell status={r.status} />,
    },
    {
      key: "createdAt",
      header: "Ordered",
      render: (_, r) => <DateCell date={r.createdAt} />,
    },
    {
      key: "id",
      header: "Actions",
      render: (_, r) => {
        const isStatusBusy = statusVars?.id === r.id && isStatusPending;
        const isCancelBusy = cancelVars === r.id && isCancelPending;
        const isCancellable = !["DELIVERED", "CANCELLED"].includes(r.status);

        return (
          <div className="flex gap-1 flex-wrap items-center">
            <button
              onClick={() => setSelectedOrder(r)}
              className="text-white/60 hover:text-[#37EFD1] hover:bg-white/5 rounded-md p-1.5 transition-colors"
              title="View details"
            >
              <Eye size={16} />
            </button>
            {r.status === "PENDING" && !isManager && (
              <ActionButton
                label="Confirm"
                loading={isStatusBusy}
                color="#37EFD1"
                onClick={() => updateStatus({ id: r.id, status: "CONFIRMED" })}
              />
            )}
            {r.status === "CONFIRMED" && (
              <ActionButton
                label="Prepare"
                loading={isStatusBusy}
                color="#60a5fa"
                onClick={() => updateStatus({ id: r.id, status: "PREPARING" })}
              />
            )}
            {r.status === "PREPARING" && (
              <ActionButton
                label="Ready"
                loading={isStatusBusy}
                color="#a78bfa"
                onClick={() => updateStatus({ id: r.id, status: "READY" })}
              />
            )}
            {r.status === "READY" && (
              <ActionButton
                label="Deliver"
                loading={isStatusBusy}
                color="rgba(255,255,255,0.6)"
                onClick={() => updateStatus({ id: r.id, status: "DELIVERED" })}
              />
            )}
            {isCancellable && !isManager && (
              <ActionButton
                label="Cancel"
                loading={isCancelBusy}
                color="#f87171"
                onClick={() => {
                  if (confirm(`Cancel order ${r.orderNumber}?`)) cancelOrder(r.id);
                }}
              />
            )}
          </div>
        );
      },
    },
  ];

  const orders = ordersData?.data ?? [];
  const total = ordersData?.total ?? 0;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Orders" value={stats.total} icon={ChefHat} color="#37EFD1" />
        <StatsCard title="Pending" value={stats.pending} icon={ChefHat} color="#fb923c" />
        <StatsCard title="Preparing" value={stats.preparing} icon={ChefHat} color="#60a5fa" />
        <StatsCard title="Delivered" value={stats.delivered} icon={ChefHat} color="#a78bfa" />
        <StatsCard
          title="Today's Revenue"
          value={`RM ${stats.todayRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="#34d399"
        />
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <DataTableSearch
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search orders..."
          />
          <DataTableFilters
            filters={[
              {
                key: "status",
                label: "All Statuses",
                options: [
                  { label: "Pending", value: "PENDING" },
                  { label: "Confirmed", value: "CONFIRMED" },
                  { label: "Preparing", value: "PREPARING" },
                  { label: "Ready", value: "READY" },
                  { label: "Delivered", value: "DELIVERED" },
                  { label: "Cancelled", value: "CANCELLED" },
                ],
              },
            ]}
            values={filters}
            onChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }}
            onReset={() => { setFilters({ status: "" }); setPage(1); }}
          />
        </div>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <DataTable data={orders} columns={columns} />
            <DataTablePagination
              page={page}
              totalPages={Math.ceil(total / 10)}
              onPage={setPage}
              total={total}
              limit={10}
            />
          </>
        )}
      </div>

      <OrderDetailsSlideOver order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  );
}