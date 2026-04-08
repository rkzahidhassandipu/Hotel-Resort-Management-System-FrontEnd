"use client";

import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
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

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => roomService.createAmenity(data),
    onSuccess: () => {
      toast.success("Amenity added");
      setNewAmenity("");
      queryClient.invalidateQueries({ queryKey: ["rooms", "amenities"] });
    },
    onError: () => toast.error("Failed to add amenity"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomService.deleteAmenity(id),
    onSuccess: () => {
      toast.success("Amenity deleted");
      queryClient.invalidateQueries({ queryKey: ["rooms", "amenities"] });
    },
    onError: () => toast.error("Failed to delete amenity"),
  });

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] p-6 bg-[#1F2028] rounded-xl text-white shadow-lg">
        <SheetHeader>
          <SheetTitle>Manage Amenities</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          {amenities.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2">
              <Input value={a.name} readOnly className="flex-1 appearance-none" />
              <Button variant="destructive" onClick={() => deleteMutation.mutate(a.id)}>
                Delete
              </Button>
            </div>
          ))}

          <div className="flex gap-2 mt-4">
            <Input
              placeholder="New Amenity"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
            />
            <Button onClick={() => createMutation.mutate({ name: newAmenity })}>Add</Button>
          </div>
        </div>

        <SheetFooter>
          <Button onClick={onClose} className="mt-4 w-full">
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}