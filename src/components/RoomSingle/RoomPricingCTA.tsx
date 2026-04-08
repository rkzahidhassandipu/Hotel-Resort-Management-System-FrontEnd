"use client";

import { Calendar, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoomPricingCTAProps {
  room: any;
  router: any;
}

export default function RoomPricingCTA({ room, router }: RoomPricingCTAProps) {
  // AVAILABLE STATE
  if (room.status === "AVAILABLE") {
    return (
      <div className="sticky bottom-6 z-50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B0C10]/90 border-2 border-[#37EFD1] rounded-xl px-6 py-5 shadow-xl backdrop-blur-md">
          {/* Price Info */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
            <p className="text-xs uppercase tracking-wide text-[#37EFD1]/70">
              Starting from
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#37EFD1]">
                RM {room.category?.basePrice?.toLocaleString() ?? "—"}
              </span>
              <span className="text-sm text-[#37EFD1]/70">/ night</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-3 sm:mt-0">
            <Button
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 border-2 border-[#37EFD1] text-[#37EFD1] hover:bg-[#37EFD1]/10 hover:text-[#00ffd5]"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Button className="flex items-center gap-2 px-4 py-2 bg-[#00ffd5] hover:bg-[#03ffd5] text-[#0B0C10] font-semibold shadow-md transition-all"  onClick={() => router.push(`/book/${room.id}`)}>
              <Calendar className="h-4 w-4" />
              Book Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // UNAVAILABLE STATE
  return (
    <div className="flex items-center gap-4 rounded-3xl border-2 border-[#37EFD1] bg-[#37EFD1]/10 shadow-md mt-4">
      <Clock className="h-6 w-6 text-[#37EFD1]" />
      <div className="flex flex-col">
        <p className="text-sm font-semibold text-[#37EFD1]">Room Unavailable</p>
        <p className="text-xs text-muted-foreground mt-1">
          This room is currently{" "}
          <strong>{room.status?.toLowerCase().replace(/_/g, " ")}</strong>.
        </p>
      </div>
    </div>
  );
}