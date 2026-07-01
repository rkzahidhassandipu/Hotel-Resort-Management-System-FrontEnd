"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { roomService } from "@/service/room.service";

export function CreateCategoryForm() {
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
      <h3 className="text-xs font-bold text-[#37EFD1] uppercase tracking-widest">
        New Category
      </h3>

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
                <label className="text-[10px] text-white/40 ml-1 uppercase">
                  Price (RM)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(e.target.value ? Number(e.target.value) : "")
                  }
                  className="bg-[#0E0F14] border-white/10"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="maxOccupancy">
            {(field) => (
              <div className="space-y-1">
                <label className="text-[10px] text-white/40 ml-1 uppercase">
                  Max Pax
                </label>
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
            <>
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </>
          )}
        </Button>
      </div>
    </div>
  );
}