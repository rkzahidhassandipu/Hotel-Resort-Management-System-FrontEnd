"use client";

import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Check, X, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { roomService } from "@/service/room.service";

interface Amenity {
  id: string;
  name: string;
}

interface AmenityModalProps {
  open: boolean;
  amenities: Amenity[];
  onClose: () => void;
}

export function AmenityModal({ open, amenities, onClose }: AmenityModalProps) {
  const queryClient = useQueryClient();
  const [newAmenity, setNewAmenity] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["rooms", "amenities"] });

  // ── Create ─────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (name: string) => roomService.createAmenity({ name }),
    onSuccess: () => {
      toast.success("Amenity added");
      setNewAmenity("");
      invalidate();
    },
    onError: () => toast.error("Failed to add amenity"),
  });

  // ── Update ─────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      roomService.updateAmenity(id, { name }),
    onSuccess: () => {
      toast.success("Amenity updated");
      setEditingId(null);
      setEditingValue("");
      invalidate();
    },
    onError: () => toast.error("Failed to update amenity"),
  });

  // ── Delete ─────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomService.deleteAmenity(id),
    onSuccess: () => {
      toast.success("Amenity deleted");
      invalidate();
    },
    onError: () => toast.error("Failed to delete amenity"),
  });

  const startEdit = (a: Amenity) => {
    setEditingId(a.id);
    setEditingValue(a.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const confirmEdit = (id: string) => {
    if (!editingValue.trim()) return;
    updateMutation.mutate({ id, name: editingValue.trim() });
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[400px] bg-[#1F2028] border-l border-white/5 text-white flex flex-col p-0"
      >
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-white text-xl">Manage Amenities</SheetTitle>
          </SheetHeader>

          {/* Amenity list */}
          <div className="space-y-2">
            {amenities.length === 0 && (
              <p className="text-center text-white/30 py-4 text-sm italic">
                No amenities found.
              </p>
            )}

            {amenities.map((a) => (
              <div key={a.id} className="flex items-center gap-2">
                {editingId === a.id ? (
                  // ── Edit mode ────────────────────────────────
                  <>
                    <Input
                      autoFocus
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmEdit(a.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="flex-1 bg-[#13141A] border-white/20 text-white h-9 focus-visible:ring-[#37EFD1]/40"
                    />
                    <button
                      onClick={() => confirmEdit(a.id)}
                      disabled={updateMutation.isPending}
                      className="p-1.5 rounded hover:bg-[#37EFD1]/10 text-[#37EFD1] transition-colors disabled:opacity-50"
                    >
                      {updateMutation.isPending && updateMutation.variables?.id === a.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Check className="h-4 w-4" />
                      }
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 rounded hover:bg-white/5 text-white/40 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  // ── View mode ────────────────────────────────
                  <>
                    <div className="flex-1 bg-[#13141A] border border-white/8 rounded-md px-3 py-2 text-sm text-white/70">
                      {a.name}
                    </div>
                    <button
                      onClick={() => startEdit(a)}
                      className="p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-[#37EFD1] transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(a.id)}
                      disabled={deleteMutation.isPending && deleteMutation.variables === a.id}
                      className="p-1.5 rounded hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleteMutation.isPending && deleteMutation.variables === a.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />
                      }
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add new */}
          <div className="flex gap-2 mt-6">
            <Input
              placeholder="New amenity name"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newAmenity.trim()) {
                  createMutation.mutate(newAmenity.trim());
                }
              }}
              className="flex-1 bg-[#13141A] border-white/10 text-white placeholder:text-white/20"
            />
            <Button
              onClick={() => {
                if (newAmenity.trim()) createMutation.mutate(newAmenity.trim());
              }}
              disabled={createMutation.isPending || !newAmenity.trim()}
              className="bg-[#37EFD1] text-[#0B0C10] hover:bg-[#2dd4be] font-semibold"
            >
              {createMutation.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : "Add"
              }
            </Button>
          </div>
        </div>

        <SheetFooter className="p-6 pt-0">
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full hover:bg-white/5 text-white/60"
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}