"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { roomService } from "@/service/room.service";

interface Category {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  weekendPrice?: number;
  maxOccupancy: number;
  amenities?: string[];
}

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
}

// ─── Inline Edit Row ─────────────────────────────────────────────────────────

function CategoryRow({ 
  cat, 
  onDelete, 
  isDeleting 
}: { 
  cat: Category; 
  onDelete: (cat: Category) => void; 
  isDeleting: boolean 
}) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; basePrice: number }) =>
      roomService.updateCategory(cat.id, data),
    // onSettled ব্যবহার করলে আপডেট হওয়ার পর UI অটো রিফ্রেশ হবে
    onSettled: () => {
      return queryClient.invalidateQueries({ queryKey: ["rooms", "categories"] });
    },
    onSuccess: () => {
      toast.success("Category updated");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Update failed");
    },
  });

  const form = useForm({
    defaultValues: {
      name: cat.name,
      basePrice: cat.basePrice,
    },
    onSubmit: async ({ value }) => {
      if (value.name === cat.name && value.basePrice === cat.basePrice) return;
      updateMutation.mutate(value);
    },
  });

  return (
    <div className="group flex flex-col gap-2 p-3 bg-[#13141A] border border-white/5 rounded-lg mb-3 hover:border-[#37EFD1]/30 transition-colors">
      <div className="flex items-center gap-2">
        <form.Field name="name">
          {(field) => (
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={() => {
                if (field.state.value !== cat.name) form.handleSubmit();
              }}
              className="h-8 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-[#37EFD1] text-sm font-medium p-0"
            />
          )}
        </form.Field>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(cat)}
          disabled={isDeleting}
          className="h-8 w-8 text-white/20 hover:text-red-400 hover:bg-red-400/10 ml-auto"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-white/50">
        <span>Price: RM</span>
        <form.Field name="basePrice">
          {(field) => (
            <input
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              onBlur={() => {
                if (Number(field.state.value) !== cat.basePrice) form.handleSubmit();
              }}
              className="w-16 bg-transparent border-b border-white/10 focus:border-[#37EFD1] outline-none text-white text-center appearance-none"
            />
          )}
        </form.Field>
        <span className="ml-auto opacity-70">Max Pax: {cat.maxOccupancy}</span>
        {updateMutation.isPending && <Loader2 className="h-3 w-3 animate-spin text-[#37EFD1]" />}
      </div>
    </div>
  );
}

// ─── Create Form ─────────────────────────────────────────────────────────────

function CreateCategoryForm() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: { name: string; basePrice: number; maxOccupancy: number }) => 
      roomService.createCategory(data),
    onSuccess: () => {
      toast.success("Category created successfully");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["rooms", "categories"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Validation failed.");
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      basePrice: "" as number | "",
      maxOccupancy: 2,
    },
    onSubmit: async ({ value }) => {
      if (!value.name || !value.basePrice) {
        toast.error("Please fill in all required fields");
        return;
      }
      createMutation.mutate({
        name: value.name.trim(),
        basePrice: Number(value.basePrice),
        maxOccupancy: Number(value.maxOccupancy),
      });
    },
  });
  

  return (
    <div className="space-y-4 pt-6 border-t border-white/10 mt-6 bg-[#1F2028] sticky bottom-0 pb-4">
      <h3 className="text-xs font-bold text-[#37EFD1] uppercase tracking-widest">New Category</h3>
      
      <div className="space-y-3">
        <form.Field name="name">
          {(field) => (
            <Input
              placeholder="Name (e.g. Deluxe Suite)"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="bg-[#0E0F14] border-white/10 focus:border-[#37EFD1]"
            />
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field name="basePrice">
            {(field) => (
              <div className="space-y-1">
                <label className="text-[10px] text-white/40 ml-1 uppercase">Price (RM)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : "")}
                  className="bg-[#0E0F14] border-white/10"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="maxOccupancy">
            {(field) => (
              <div className="space-y-1">
                <label className="text-[10px] text-white/40 ml-1 uppercase">Max Pax</label>
                <Input
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="bg-[#0E0F14] border-white/10"
                />
              </div>
            )}
          </form.Field>
        </div>

        <Button
          onClick={form.handleSubmit}
          disabled={createMutation.isPending}
          className="w-full bg-[#37EFD1] hover:bg-[#2dd4b3] text-black font-bold"
        >
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <><Plus className="h-4 w-4 mr-2" /> Add Category</>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Modal ──────────────────────────────────────────────────────────────

export function CategoryModal({ open, onClose }: CategoryModalProps) {
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["rooms", "categories"],
    queryFn: async () => {
      const res = await roomService.getCategories();
      // আপনার API স্ট্রাকচার অনুযায়ী ডাটা বের করা
      const rootData = res?.data;
      return (Array.isArray(rootData?.data) ? rootData.data : Array.isArray(rootData) ? rootData : []) as Category[];
    },
    enabled: open,
    staleTime: 0,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomService.deleteCategory(id),
    onSuccess: () => {
      toast.success("Category deleted");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["rooms", "categories"] });
    },
  });
  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent side="right" className="w-full sm:w-[400px] bg-[#1F2028] border-l border-white/5 text-white flex flex-col p-0">
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-white text-xl">Manage Categories</SheetTitle>
            </SheetHeader>

            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#37EFD1]" /></div>
            ) : (
              <div className="space-y-1">
                {categories.length === 0 && (
                  <p className="text-center text-white/30 py-4 text-sm italic">No categories found.</p>
                )}
                {categories?.data?.data.map((cat) => (
                  <CategoryRow 
                    key={cat.id} 
                    cat={cat} 
                    onDelete={setDeleteTarget} 
                    isDeleting={deleteMutation.isPending && deleteTarget?.id === cat.id}
                  />
                ))}
              </div>
            )}
            
            <CreateCategoryForm />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="bg-[#13141A] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/50 leading-relaxed">
            This action is permanent. Any rooms assigned to this category will need to be updated.
          </p>
          <DialogFooter className="mt-6 gap-2">
            <Button variant="ghost" className="hover:bg-white/5" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}