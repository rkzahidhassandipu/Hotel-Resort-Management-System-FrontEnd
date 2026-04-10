"use client"

import { 
  MoreHorizontal, Wrench, Image, DollarSign, Tag, Trash2, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub,
  DropdownMenuSubTrigger, DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Room } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { roomService } from "@/service/room.service";

interface RoomActionsProps {
  room: Room;
  pendingKey: string | null;
  onStatusChange: (id: string, status: string) => void;
  onUploadClick: (room: Room) => void;
  onPricingClick: (room: Room) => void;
  onDeleteClick: (room: Room) => void;
  onSyncAmenities: (room: Room) => void;
}

export function RoomActions({
  room, pendingKey, onStatusChange, onUploadClick, onPricingClick, onDeleteClick, onSyncAmenities
}: RoomActionsProps) {
  const { data: statuses = [], isLoading } = useQuery<unknown[], unknown>({
    queryKey: ["room-statuses"],
    queryFn: async () => {
      const response = await roomService.getStatuses();
      return response.data?.data ?? response.data ?? [];
    },
  });

  const statusOptions = Array.isArray(statuses)
    ? statuses
        .map((item) => {
          if (typeof item === "string") {
            return { value: item, label: item.replace(/_/g, " ") };
          }

          if (item && typeof item === "object") {
            const value =
              (item as any).value ??
              (item as any).status ??
              (item as any).name ??
              (item as any).key;
            const label =
              (item as any).label ??
              (item as any).name ??
              (typeof value === "string" ? value.replace(/_/g, " ") : undefined);

            if (typeof value === "string") {
              return {
                value,
                label: typeof label === "string" ? label : value.replace(/_/g, " "),
              };
            }
          }

          return null;
        })
        .filter((option): option is { value: string; label: string } => option !== null)
    : [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/30 hover:text-white hover:bg-white/5">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#1A1B21] border-white/8 text-white min-w-[180px]">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="text-white/70 text-xs cursor-pointer">
            <Wrench className="h-3.5 w-3.5 mr-2 text-white/40" /> Change Status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-[#1A1B21] border-white/8 text-white">
            <DropdownMenuItem disabled className="text-white/40 text-xs">
              Current: {room.status.replace(/_/g, " ")}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            {isLoading ? (
              <DropdownMenuItem disabled className="text-white/60 text-xs">
                Loading statuses...
              </DropdownMenuItem>
            ) : statusOptions.filter((option) => option.value !== room.status).length === 0 ? (
              <DropdownMenuItem disabled className="text-white/60 text-xs">
                No statuses available
              </DropdownMenuItem>
            ) : (
              statusOptions.filter((option) => option.value !== room.status).map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onStatusChange(room.id, option.value)}
                  className="text-white/60 text-xs cursor-pointer focus:bg-white/5 focus:text-white"
                >
                  {pendingKey === room.id + option.value ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  ) : (
                    <span className="w-3 h-3 mr-2" />
                  )}
                  {option.label}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem onClick={() => onUploadClick(room)} className="text-white/70 text-xs cursor-pointer focus:bg-white/5 focus:text-white">
          <Image className="h-3.5 w-3.5 mr-2 text-white/40" /> Upload Images
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPricingClick(room)} className="text-white/70 text-xs cursor-pointer focus:bg-white/5 focus:text-white">
          <DollarSign className="h-3.5 w-3.5 mr-2 text-white/40" /> Add Pricing Rule
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSyncAmenities(room)} className="text-white/70 text-xs cursor-pointer focus:bg-white/5 focus:text-white">
          <Tag className="h-3.5 w-3.5 mr-2 text-white/40" /> Sync Amenities
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem onClick={() => onDeleteClick(room)} className="text-red-400 hover:text-red-300 focus:bg-red-500/5 text-xs cursor-pointer">
          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Room
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}