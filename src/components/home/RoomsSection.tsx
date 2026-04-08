'use client';

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoomSlider from "../modules/Public/RoomSlider";

export default function RoomsSection() {
  return (
    <section className="py-20 bg-[#0B0C10]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* header */}
        <div className="text-center mb-14">
          <p className="text-[#37EFD1] text-[11px] font-sans tracking-[0.35em] uppercase mb-3">
            Accommodations
          </p>

          <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
            Rooms & Suites
          </h2>

          <div className="divider-crimson mx-auto mb-5" />

          <p className="text-white/50 font-sans max-w-lg mx-auto">
            526 uniquely crafted water chalets, villas, and suites — each positioned
            above the shimmering South China Sea.
          </p>
        </div>

        {/* slider */}
        <RoomSlider />

        {/* button */}
        <div className="text-center mt-10">
          <Button
            asChild
            variant="outline"
            className="border-white/15 hover:border-[#C8102E]/60 
            text-white hover:text-[#C8102E] 
            px-8 py-3 text-sm font-medium
            hover:bg-transparent"
          >
            <Link href="/rooms-suites" className="flex items-center gap-2">
              View All Rooms
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}