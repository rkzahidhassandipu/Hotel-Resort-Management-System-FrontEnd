"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { roomService } from "@/service/room.service";
import { Category } from "@/types";

export function CategoryRow({ cat, onDelete, isDeleting }: { cat: Category; onDelete: (cat: Category) => void; isDeleting: boolean }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; basePrice: number }) => roomService.updateCategory(cat.id, data),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["rooms", "categories"] }),
    onSuccess: () => toast.success("Category updated"),
    onError: (err: any) => toast.error(err?.response?.data?.message ?? "Update failed"),
  });

  const form = useForm({
    defaultValues: { name: cat.name, basePrice: cat.basePrice },
    onSubmit: async ({ value }) => {
      if (value.name === cat.name && value.basePrice === cat.basePrice) return;
      updateMutation.mutate(value);
    },
  });

  return (
    <div className="flex flex-col gap-2 p-3 bg-[#13141A] border border-white/5 rounded-lg mb-3 hover:border-[#C8102E]/30 transition-colors">
      <div className="flex items-center gap-2">
        <form.Field name="name">
          {(field) => (
            <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}
              onBlur={() => { if (field.state.value !== cat.name) form.handleSubmit(); }}
              className="h-8 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-[#C8102E] text-sm font-medium p-0" />
          )}
        </form.Field>
        <Button variant="ghost" size="icon" onClick={() => onDelete(cat)} disabled={isDeleting}
          className="h-8 w-8 ml-auto text-white/20 hover:text-red-400 hover:bg-red-400/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2 text-xs text-white/50">
        <span>Price: RM</span>
        <form.Field name="basePrice">
          {(field) => (
            <input type="number" value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              onBlur={() => { if (Number(field.state.value) !== cat.basePrice) form.handleSubmit(); }}
              className="w-16 bg-transparent border-b border-white/10 focus:border-[#C8102E] outline-none text-white text-center appearance-none" />
          )}
        </form.Field>
        <span className="ml-auto opacity-70">Max Pax: {cat.maxOccupancy}</span>
        {updateMutation.isPending && <Loader2 className="h-3 w-3 animate-spin text-[#C8102E]" />}
      </div>
    </div>
  );
}