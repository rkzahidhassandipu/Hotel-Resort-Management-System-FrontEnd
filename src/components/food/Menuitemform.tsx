"use client";
import { useState, useRef } from "react";
import { Field, FormActions, SelectField, Toggle, inputCls } from "./Foodui";
import { MenuCategory, MenuItem } from "@/types";

const FOOD_CATEGORY_OPTIONS = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACKS",
  "BEVERAGES",
  "DESSERTS",
  "SPECIAL",
].map((c) => ({ label: c, value: c }));

export function MenuItemForm({
  categories,
  initial,
  loading,
  onSubmit,
  onCancel,
}: {
  categories: MenuCategory[];
  initial: MenuItem | null;
  loading: boolean;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? 0,
    categoryId: initial?.categoryId ?? "",
    foodCategory: initial?.foodCategory ?? "LUNCH",
    preparationTime: initial?.preparationTime ?? undefined,
    isAvailable: initial?.isAvailable ?? true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initial?.imageUrl ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    const formData = new FormData();

    // Form fields append
    Object.entries(form).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Image append
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    onSubmit(formData);
  };

  return (
    <div className="bg-[#0E0F14] border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white text-sm font-medium">
          {initial ? "Edit Menu Item" : "New Menu Item"}
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
            value={form.foodCategory}
            onChange={(v) => set("foodCategory", v as typeof form.foodCategory)}
            placeholder="Select meal type"
            options={FOOD_CATEGORY_OPTIONS}
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
              set(
                "preparationTime",
                e.target.value ? parseInt(e.target.value) : undefined,
              )
            }
          />
        </Field>

        <Field label="Item Image">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`${inputCls} cursor-pointer flex items-center justify-center h-10 border-dashed border border-white/20 hover:border-white/40`}
          >
            {selectedFile ? selectedFile.name : "Click to select image"}
          </div>
          {previewUrl && (
            <div className="mt-2 relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-20 w-20 object-cover rounded border border-white/10"
              />
            </div>
          )}
        </Field>

        <Field label="Description" className="sm:col-span-2">
          <textarea
            rows={2}
            className={inputCls + " resize-none"}
            placeholder="Short description..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>

        <div className="flex items-center gap-2">
          <Toggle
            value={form.isAvailable}
            onChange={(v) => set("isAvailable", v)}
          />
          <span className="text-xs text-white/50">Available</span>
        </div>
      </div>

      <FormActions
        loading={loading}
        disabled={!form.name || !form.categoryId || form.price <= 0}
        label={initial ? "Save Changes" : "Create Item"}
        onCancel={onCancel}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
