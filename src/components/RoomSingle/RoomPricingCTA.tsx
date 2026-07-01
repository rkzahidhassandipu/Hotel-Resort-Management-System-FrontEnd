"use client";

import { Calendar, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoomPricingCTAProps {
  room: any;
  router: any;
}

export default function RoomPricingCTA({ room, router }: RoomPricingCTAProps) {
  const isAvailable = room.status === "AVAILABLE";

  return (
    <div className="w-full mt-8 md:mt-0">
      {isAvailable ? (
        <div className="bg-[#1A1B21] border border-white/10 rounded-2xl p-6 shadow-2xl">
          {/* Price Header */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">
              Starting from
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-semibold text-white">
                RM {room.category?.basePrice?.toLocaleString() ?? "—"}
              </span>
              <span className="text-sm text-white/40">/ night</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button 
              className="w-full h-12 bg-[#37EFD1] hover:bg-[#2de0c2] text-[#0B0C10] font-bold text-lg" 
              onClick={() => router.push(`/book/${room.id}`)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book Now
            </Button>
            
            <Button
              variant="outline"
              className="w-full h-12 border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Gallery
            </Button>
          </div>

          <p className="text-[10px] text-center text-white/20 mt-6 italic">
            *Complimentary breakfast included
          </p>
        </div>
      ) : (
        /* Unavailable state */
        <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-6">
          <Clock className="h-8 w-8 text-white/20" />
          <div>
            <p className="text-white font-medium">Room Unavailable</p>
            <p className="text-sm text-white/40">Currently in {room.status?.toLowerCase().replace(/_/g, " ")} status.</p>
          </div>
        </div>
      )}
    </div>
  );
}