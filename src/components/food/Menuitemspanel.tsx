"use client";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import DataTableSearch from "@/components/shared/table/DataTableSearch";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import { foodService } from "@/service/food.service";
import { MenuItem, MenuItemPayload } from "@/types";
import { foodKeys, useMenuQuery } from "@/app/query/Food.queries";
import { MenuItemForm } from "./Menuitemform";
import { ActiveBadge, EmptyState, IconBtn, SelectField, Spinner } from "./Foodui";

export function MenuItemsPanel() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [filterCat, setFilterCat] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: menuRaw, isLoading } = useMenuQuery();

  const categories = menuRaw ?? [];
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
    mutationFn: (data: FormData) => foodService.createMenuItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.menu() });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: unknown }) => {
    console.log("ID:", id);

    if (data instanceof FormData) {
      for (const [key, value] of data.entries()) {
        console.log(`${key}:`, value);
      }
    } else {
      console.log("Data:", data);
    }

    return foodService.updateMenuItem(id, data as FormData);
  },

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: foodKeys.menu(),
    });
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
      createMutation.mutate(payload as FormData);
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