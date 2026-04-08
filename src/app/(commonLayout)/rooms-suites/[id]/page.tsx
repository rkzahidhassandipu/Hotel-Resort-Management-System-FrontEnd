"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, XCircle } from "lucide-react";

import { roomService } from "@/service/room.service";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import RoomHeader from "@/components/RoomSingle/RoomHeader";
import RoomImages from "@/components/RoomSingle/RoomImages";
import RoomInfoGrid from "@/components/RoomSingle/RoomInfoGrid";
import RoomAmenities from "@/components/RoomSingle/RoomAmenities";
import RoomPricingCTA from "@/components/RoomSingle/RoomPricingCTA";

interface RoomData {
  roomNumber: string;
  description?: string;
  floor: number;
  type: string;
  bedType: string;
  maxOccupancy: number;
  sizeInSqFt?: number;
  status: string;
  smokingAllowed: boolean;
  petFriendly: boolean;
  view?: string;
  images?: { imageUrl: string; caption?: string; isPrimary?: boolean }[];
  amenities?: {
    amenity?: { name: string; icon?: string };
    name?: string;
    icon?: string;
  }[];
  category?: {
    name?: string;
    basePrice?: number;
    weekendPrice?: number;
  };
}

const STATUS_STYLE: Record<string, string> = {
  AVAILABLE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  OCCUPIED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  MAINTENANCE: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  CLEANING: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  OUT_OF_ORDER: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function RoomDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;

  const { data: room, isLoading, isError } = useQuery<RoomData>({
    queryKey: ["room", roomId],
    queryFn: async () => {
      const res = await roomService.getById(roomId);
      return res.data.data;
    },
    enabled: !!roomId,
  });

  // Loading
  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <p className="text-muted-foreground">Loading room...</p>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex flex-col items-center py-24 gap-4">
        <XCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to load room</h2>

        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  // Not found
  if (!room) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex flex-col items-center py-24 gap-4">
        <h2 className="text-lg font-semibold">Room not found</h2>

        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const statusStyle =
    STATUS_STYLE[room.status] ??
    "bg-muted text-muted-foreground border-border";

  const amenities = (room.amenities ?? []).map((a) => ({
    name: a.amenity?.name ?? a.name ?? "Amenity",
    icon: a.amenity?.icon ?? a.icon,
  }));

  return (
    <div className="bg-[#0B0C10] ">
        <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Rooms
        </Button>

        <span className="text-muted-foreground/40">/</span>

        <span className="text-sm text-muted-foreground">
          Room {room.roomNumber}
        </span>
      </div>

      {/* Header */}
      <RoomHeader room={room} statusStyle={statusStyle} />

      {/* Images */}
      <RoomImages images={room.images ?? []} />

      {/* Info */}
      <RoomInfoGrid room={room} />

      {/* Divider */}
      <div className="h-px bg-border mb-6" />

      {/* Amenities */}
      <RoomAmenities amenities={amenities} />

      {/* CTA */}
      <RoomPricingCTA room={room} router={router} />

    </div>
    </div>
  );
}