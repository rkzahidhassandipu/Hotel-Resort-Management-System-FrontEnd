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
import { CreateCategoryForm } from "./create-category-form";
import { CategoryRow } from "./category-row";

export interface Category {
  id: string;
  name: string;
  basePrice: number;
  maxOccupancy: number;
  description?: string;
  weekendPrice?: number;
  amenities?: string[];
}

export function CategoryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["rooms", "categories"],
    queryFn: async () => {
      const res = (await roomService.getCategories()) as any;
      const raw = res?.data?.data ?? res?.data ?? res;
      return (Array.isArray(raw) ? raw : []) as Category[];
    },
    enabled: open,
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomService.deleteCategory(id),
    onSuccess: () => {
      toast.success("Category deleted");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["rooms", "categories"] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Delete failed"),
  });

  const result = categories?.data?.data ?? categories?.data ?? categories;

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
              <div>
                {categories.length === 0 && (
                  <p className="text-center text-white/30 py-4 text-sm italic">
                    No categories found.
                  </p>
                )}
                {result.map((cat: any) => (
                  <CategoryRow
                    key={cat.id}
                    cat={cat}
                    onDelete={setDeleteTarget}
                    isDeleting={
                      deleteMutation.isPending && deleteTarget?.id === cat.id
                    }
                  />
                ))}
              </div>
            )}
            <CreateCategoryForm />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <DialogContent className="bg-[#13141A] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/50">
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
