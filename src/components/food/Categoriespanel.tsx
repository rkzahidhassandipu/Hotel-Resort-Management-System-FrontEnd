"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil } from "lucide-react";
import { foodService } from "@/service/food.service";
import {
  ActiveBadge,
  EmptyState,
  Field,
  FormActions,
  IconBtn,
  Spinner,
  Toggle,
  inputCls,
} from "./Foodui";
import { foodKeys, useMenuQuery } from "@/app/query/Food.queries";
import { MenuCategory } from "@/types";

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
    <div className="bg-[#0E0F14] border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white text-sm font-medium">
          {initial ? "Edit Category" : "New Category"}
        </h3>
        <button
          onClick={onCancel}
          className="text-white/30 hover:text-white/60 transition-colors"
        >
          ✕
        </button>
      </div>
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
    </div>
  );
}

// ─── Categories Panel ─────────────────────────────────────────────────────────
export function CategoriesPanel() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuCategory | null>(null);

  const { data: menuRaw, isLoading } = useMenuQuery();
  const categories: MenuCategory[] = menuRaw ?? [];

  const createMutation = useMutation({
    mutationFn: (data: unknown) => foodService.createMenuCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.menu() });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      foodService.updateMenuCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.menu() });
      setEditing(null);
      setShowForm(false);
    },
  });

  function handleSubmit(
    payload: Omit<MenuCategory, "id" | "_count" | "menuItems">,
  ) {
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
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
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
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
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
                  <p className="text-white text-sm font-medium truncate">
                    {cat.name}
                  </p>
                  <ActiveBadge
                    active={cat.isActive}
                    on="Active"
                    off="Inactive"
                  />
                </div>
                {cat.description && (
                  <p className="text-white/35 text-xs line-clamp-2">
                    {cat.description}
                  </p>
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
                  onClick={() => {
                    setShowForm(false);
                    setEditing(cat);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
