"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Category, CategoryRow } from "./Category/Categoryrow";
import { CreateCategoryForm } from "./Category/Createcategoryform";

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
}

export function CategoryModal({ open, onClose }: CategoryModalProps) {
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  // ─────────────────────────────────────────────
  // SAFE QUERY (always returns array)
  // ─────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["rooms", "categories"],
    queryFn: async () => {
      const raw = await roomService.getCategories();

//       const raw = res?.data ?? res;
// console.log("CATEGORIES RAW RESPONSE:", res);
      if (Array.isArray(raw?.data)) return raw.data;
      if (Array.isArray(raw)) return raw;

      return [];
    },
    enabled: open,
  });

  const categories: Category[] = Array.isArray(data) ? data : [];

  // ─────────────────────────────────────────────
  // DELETE MUTATION
  // ─────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomService.deleteCategory(id),
    onSuccess: () => {
      toast.success("Category deleted");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["rooms", "categories"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Delete failed");
    },
  });

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:w-[400px] bg-[#1F2028] border-l border-white/5 text-white flex flex-col p-0"
        >
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-white text-xl">
                Manage Categories
              </SheetTitle>
            </SheetHeader>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#37EFD1]" />
              </div>
            ) : (
              <div className="space-y-1">
                {categories.length === 0 && (
                  <p className="text-center text-white/30 py-4 text-sm italic">
                    No categories found.
                  </p>
                )}

                {categories.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    cat={cat}
                    onDelete={setDeleteTarget}
                    isDeleting={
                      deleteMutation.isPending &&
                      deleteTarget?.id === cat.id
                    }
                  />
                ))}
              </div>
            )}

            <CreateCategoryForm />
          </div>
        </SheetContent>
      </Sheet>

      {/* ─────────────────────────────────────────────
          DELETE CONFIRM DIALOG
         ───────────────────────────────────────────── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <DialogContent className="bg-[#13141A] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Delete {deleteTarget?.name}?
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-white/50 leading-relaxed">
            This action is permanent. Any rooms assigned to this category will
            need to be updated.
          </p>

          <DialogFooter className="mt-6 gap-2">
            <Button
              variant="ghost"
              className="hover:bg-white/5"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete Permanently"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}