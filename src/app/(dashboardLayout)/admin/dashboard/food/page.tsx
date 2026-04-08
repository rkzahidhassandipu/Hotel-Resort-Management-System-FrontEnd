"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChefHat,
  UtensilsCrossed,
  LayoutGrid,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  ChevronDown,
  DollarSign,
  XCircle,
} from "lucide-react";
import DataTable, { Column } from "@/components/shared/table/DataTable";
import DataTableSearch from "@/components/shared/table/DataTableSearch";
import DataTableFilters from "@/components/shared/table/DataTableFilters";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import DateCell from "@/components/shared/cell/DateCell";
import StatsCard from "@/components/shared/StatsCard";
import { foodService } from "@/service/food.service";
import type { FoodOrder } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  menuItems?: MenuItem[];
  _count?: { items: number };
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  category?: MenuCategory;
  isAvailable: boolean;
  imageUrl?: string;
  foodCategory?: string;
  preparationTime?: number;
}

type MenuItemPayload = Omit<MenuItem, "id" | "category">;

type ByStatusEntry = { status: string; _count: { status: number } };
type Tab = "orders" | "items" | "categories";

// ─── Query Keys ───────────────────────────────────────────────────────────────
const foodKeys = {
  all: ["food"] as const,
  orders: (p: Record<string, unknown>) => ["food", "orders", p] as const,
  stats: () => ["food", "stats"] as const,
  menu: () => ["food", "menu"] as const,
};

// ─── Stats parser ─────────────────────────────────────────────────────────────
function parseStats(raw: Record<string, unknown>) {
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

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputCls =
  "w-full bg-[#0E0F14] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#37EFD1]/50 transition-colors";
const labelCls = "block text-xs text-white/40 mb-1.5 font-sans";

// ════════════════════════════════════════════════════════════════════════════
// ROOT PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function AdminFoodPage() {
  const [tab, setTab] = useState<Tab>("orders");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "orders", label: "Orders", icon: <ChefHat className="h-3.5 w-3.5" /> },
    { key: "items", label: "Menu Items", icon: <UtensilsCrossed className="h-3.5 w-3.5" /> },
    { key: "categories", label: "Categories", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white font-semibold">Food & Orders</h1>
        <p className="text-white/35 text-sm font-sans mt-0.5">
          Manage restaurant orders, menu items and categories
        </p>
      </div>

      <div className="flex gap-1 bg-[#1A1B21] border border-white/5 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
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
      {tab === "categories" && <CategoriesPanel />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ORDERS PANEL
// ════════════════════════════════════════════════════════════════════════════
function OrdersPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "" });
  const [page, setPage] = useState(1);

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

  const { mutate: updateStatus, variables: statusVars } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      foodService.updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: foodKeys.all }),
  });

  const { mutate: cancelOrder, variables: cancelVars } = useMutation({
    mutationFn: (id: string) => foodService.cancelOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: foodKeys.all }),
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
        const isStatusBusy = statusVars?.id === r.id;
        const isCancelBusy = cancelVars === r.id;
        const isCancellable = !["DELIVERED", "CANCELLED"].includes(r.status);

        return (
          <div className="flex gap-1 flex-wrap">
            {r.status === "PENDING" && (
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
            {isCancellable && (
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
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MENU ITEMS PANEL
// ════════════════════════════════════════════════════════════════════════════
function MenuItemsPanel() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [filterCat, setFilterCat] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: menuRaw, isLoading } = useMenuQuery();
  const categories: MenuCategory[] = menuRaw ?? [];
  const allItems: MenuItem[] = categories.flatMap((c) =>
    (c.menuItems ?? []).map((i) => ({ ...i, category: c })),
  );
  const filtered = allItems.filter(
    (i) =>
      (!filterCat || i.categoryId === filterCat) &&
      (!search || i.name.toLowerCase().includes(search.toLowerCase())),
  );
  const paged = filtered.slice((page - 1) * 10, page * 10);

  const createMutation = useMutation({
    mutationFn: (data: unknown) => foodService.createMenuItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.menu() });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      foodService.updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.menu() });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => foodService.deleteMenuItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: foodKeys.menu() }),
  });

  function handleSubmit(payload: MenuItemPayload) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          <DataTableSearch
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search items..."
          />
          <SelectField
            value={filterCat}
            onChange={(v) => { setFilterCat(v); setPage(1); }}
            placeholder="All Categories"
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
            className="w-44"
          />
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#37EFD1]/10 border border-[#37EFD1]/20 text-[#37EFD1] text-sm hover:bg-[#37EFD1]/20 transition-all"
        >
          <Plus className="h-3.5 w-3.5" /> Add Item
        </button>
      </div>

      {(showForm || editing) && (
        <MenuItemForm
          categories={categories}
          initial={editing}
          loading={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {isLoading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState label="No menu items found" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Name", "Category", "Price", "Prep Time", "Available", ""].map((h) => (
                    <th key={h} className="text-left text-xs text-white/30 font-medium pb-3 pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paged.map((item) => (
                  <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4">
                      <p className="text-white font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-white/35 text-xs mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10">
                        {item.category?.name ?? "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-white font-mono">
                      RM {Number(item.price).toFixed(2)}
                    </td>
                    <td className="py-3 pr-4 text-white/40 text-xs">
                      {item.preparationTime ? `${item.preparationTime}m` : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <ActiveBadge active={item.isAvailable} on="Available" off="Unavailable" />
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <IconBtn
                          icon={<Pencil className="h-3.5 w-3.5" />}
                          color="#60a5fa"
                          title="Edit"
                          onClick={() => { setShowForm(false); setEditing(item); }}
                        />
                        <IconBtn
                          icon={<Trash2 className="h-3.5 w-3.5" />}
                          color="#f87171"
                          title="Delete"
                          loading={
                            deleteMutation.isPending && deleteMutation.variables === item.id
                          }
                          onClick={() => {
                            if (confirm(`Delete "${item.name}"?`)) deleteMutation.mutate(item.id);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DataTablePagination
            page={page}
            totalPages={Math.ceil(filtered.length / 10)}
            onPage={setPage}
            total={filtered.length}
            limit={10}
          />
        </>
      )}
    </div>
  );
}

// ─── Menu Item Form ───────────────────────────────────────────────────────────
function MenuItemForm({
  categories,
  initial,
  loading,
  onSubmit,
  onCancel,
}: {
  categories: MenuCategory[];
  initial: MenuItem | null;
  loading: boolean;
  onSubmit: (d: MenuItemPayload) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<MenuItemPayload>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? 0,
    categoryId: initial?.categoryId ?? "",
    foodCategory: initial?.foodCategory ?? "LUNCH",
    preparationTime: initial?.preparationTime ?? undefined,
    isAvailable: initial?.isAvailable ?? true,
    imageUrl: initial?.imageUrl ?? "",
  });

  const set = <K extends keyof MenuItemPayload>(k: K, v: MenuItemPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const foodCatOptions = [
    "BREAKFAST", "LUNCH", "DINNER", "SNACKS", "BEVERAGES", "DESSERTS", "SPECIAL",
  ].map((c) => ({ label: c, value: c }));

  return (
    <InlineForm title={initial ? "Edit Menu Item" : "New Menu Item"} onCancel={onCancel}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Name *">
          <input
            className={inputCls}
            placeholder="e.g. Nasi Lemak"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <Field label="Category *">
          <SelectField
            value={form.categoryId}
            onChange={(v) => set("categoryId", v)}
            placeholder="Select category"
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
        </Field>
        <Field label="Price (RM) *">
          <input
            type="number"
            min={0}
            step={0.01}
            className={inputCls}
            placeholder="0.00"
            value={form.price}
            onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
          />
        </Field>
        <Field label="Food Category">
          <SelectField
            value={form.foodCategory ?? ""}
            onChange={(v) => set("foodCategory", v)}
            placeholder="Select meal type"
            options={foodCatOptions}
          />
        </Field>
        <Field label="Preparation Time (mins)">
          <input
            type="number"
            min={0}
            className={inputCls}
            placeholder="e.g. 15"
            value={form.preparationTime ?? ""}
            onChange={(e) =>
              set("preparationTime", e.target.value ? parseInt(e.target.value) : undefined)
            }
          />
        </Field>
        <Field label="Image URL">
          <input
            className={inputCls}
            placeholder="https://..."
            value={form.imageUrl ?? ""}
            onChange={(e) => set("imageUrl", e.target.value)}
          />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <textarea
            rows={2}
            className={inputCls + " resize-none"}
            placeholder="Short description..."
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <div className="flex items-center gap-2">
          <Toggle value={form.isAvailable} onChange={(v) => set("isAvailable", v)} />
          <span className="text-xs text-white/50">Available</span>
        </div>
      </div>
      <FormActions
        loading={loading}
        disabled={!form.name || !form.categoryId || form.price <= 0}
        label={initial ? "Save Changes" : "Create Item"}
        onCancel={onCancel}
        onSubmit={() => onSubmit(form)}
      />
    </InlineForm>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CATEGORIES PANEL
// ════════════════════════════════════════════════════════════════════════════
function CategoriesPanel() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuCategory | null>(null);

  const { data: menuRaw, isLoading } = useMenuQuery();
  const categories: MenuCategory[] = menuRaw ?? [];

  const createMutation = useMutation({
    mutationFn: (data: unknown) => foodService.admin.createMenuCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.menu() });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      foodService.admin.updateMenuCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.menu() });
      setEditing(null);
      setShowForm(false);
    },
  });

  function handleSubmit(payload: Omit<MenuCategory, "id" | "_count" | "menuItems">) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5 space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#37EFD1]/10 border border-[#37EFD1]/20 text-[#37EFD1] text-sm hover:bg-[#37EFD1]/20 transition-all"
        >
          <Plus className="h-3.5 w-3.5" /> Add Category
        </button>
      </div>

      {(showForm || editing) && (
        <CategoryForm
          initial={editing}
          loading={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {isLoading ? (
        <Spinner />
      ) : categories.length === 0 ? (
        <EmptyState label="No categories yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group bg-[#0E0F14] border border-white/5 rounded-xl p-4 flex items-start justify-between hover:border-white/10 transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white text-sm font-medium truncate">{cat.name}</p>
                  <ActiveBadge active={cat.isActive} on="Active" off="Inactive" />
                </div>
                {cat.description && (
                  <p className="text-white/35 text-xs line-clamp-2">{cat.description}</p>
                )}
                <p className="text-white/25 text-xs">
                  {cat.menuItems?.length ?? cat._count?.items ?? 0} items
                </p>
              </div>
              <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <IconBtn
                  icon={<Pencil className="h-3.5 w-3.5" />}
                  color="#60a5fa"
                  title="Edit"
                  onClick={() => { setShowForm(false); setEditing(cat); }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Category Form ────────────────────────────────────────────────────────────
function CategoryForm({
  initial,
  loading,
  onSubmit,
  onCancel,
}: {
  initial: MenuCategory | null;
  loading: boolean;
  onSubmit: (d: Omit<MenuCategory, "id" | "_count" | "menuItems">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    isActive: initial?.isActive ?? true,
  });
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <InlineForm title={initial ? "Edit Category" : "New Category"} onCancel={onCancel}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Name *">
          <input
            className={inputCls}
            placeholder="e.g. Main Course"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <div className="flex items-end gap-2 pb-0.5">
          <Toggle value={form.isActive} onChange={(v) => set("isActive", v)} />
          <span className="text-xs text-white/50">Active</span>
        </div>
        <Field label="Description" className="sm:col-span-2">
          <input
            className={inputCls}
            placeholder="Optional description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
      </div>
      <FormActions
        loading={loading}
        disabled={!form.name}
        label={initial ? "Save Changes" : "Create Category"}
        onCancel={onCancel}
        onSubmit={() => onSubmit(form)}
      />
    </InlineForm>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SHARED HOOK
// ════════════════════════════════════════════════════════════════════════════
function useMenuQuery() {
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

// ════════════════════════════════════════════════════════════════════════════
// MICRO-COMPONENTS
// ════════════════════════════════════════════════════════════════════════════
function InlineForm({
  title,
  children,
  onCancel,
}: {
  title: string;
  children: React.ReactNode;
  onCancel: () => void;
}) {
  return (
    <div className="bg-[#0E0F14] border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white text-sm font-medium">{title}</h3>
        <button onClick={onCancel} className="text-white/30 hover:text-white/60 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function FormActions({
  loading,
  disabled,
  label,
  onCancel,
  onSubmit,
}: {
  loading: boolean;
  disabled: boolean;
  label: string;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <button
        onClick={onCancel}
        className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors"
      >
        Cancel
      </button>
      <button
        disabled={loading || disabled}
        onClick={onSubmit}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#37EFD1]/10 border border-[#37EFD1]/20 text-[#37EFD1] text-xs hover:bg-[#37EFD1]/20 transition-all disabled:opacity-40"
      >
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
        {label}
      </button>
    </div>
  );
}

function SelectField({
  value,
  onChange,
  placeholder,
  options,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls + " appearance-none pr-8"}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-8 h-4 rounded-full transition-colors ${value ? "bg-[#37EFD1]/30" : "bg-white/10"}`}
    >
      <span
        className={`absolute top-0.5 w-3 h-3 rounded-full transition-transform ${
          value ? "translate-x-4 bg-[#37EFD1]" : "translate-x-0.5 bg-white/30"
        }`}
      />
    </button>
  );
}

function ActiveBadge({ active, on, off }: { active: boolean; on: string; off: string }) {
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${
        active
          ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
          : "border-white/10 text-white/30 bg-white/5"
      }`}
    >
      {active ? on : off}
    </span>
  );
}

function ActionButton({
  label,
  loading,
  color,
  onClick,
}: {
  label: string;
  loading: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{ color, borderColor: `${color}4D` }}
      className="text-[9px] px-2 py-0.5 rounded border hover:opacity-80 transition-all disabled:opacity-40"
    >
      {loading ? "..." : label}
    </button>
  );
}

function IconBtn({
  icon,
  color,
  title,
  loading,
  onClick,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      disabled={loading}
      onClick={onClick}
      style={{ color, borderColor: `${color}33` }}
      className="p-1.5 rounded-lg border hover:opacity-80 transition-all disabled:opacity-40"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}
    </button>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-white/30" />
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-white/20 gap-2">
      <UtensilsCrossed className="h-8 w-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}