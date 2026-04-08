'use client';

import Link from "next/link";
import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function QuickBookingBar() {
  return (
    <section className="bg-[#1A1B21] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          
          {/* left title */}
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#C8102E]" />
            <span className="text-white font-sans text-sm font-medium">
              Quick Booking
            </span>
          </div>

          {/* right inputs */}
          <div className="flex flex-wrap gap-3 flex-1 justify-end">
            
            <Input
              type="date"
              className="w-[160px] bg-[#0B0C10] text-white/70 text-sm 
              border-white/10 focus-visible:ring-0 
              focus-visible:border-[#37EFD1]/50"
            />

            <Input
              type="date"
              className="w-[160px] bg-[#0B0C10] text-white/70 text-sm 
              border-white/10 focus-visible:ring-0 
              focus-visible:border-[#37EFD1]/50"
            />

            <Select>
              <SelectTrigger
                className="w-[160px] bg-[#0B0C10] text-white/70 text-sm 
                border-white/10 focus:ring-0 
                focus:border-[#37EFD1]/50"
              >
                <SelectValue placeholder="2 Adults" />
              </SelectTrigger>

              <SelectContent className="bg-[#0B0C10] border-white/10 text-white">
                <SelectItem value="2">2 Adults</SelectItem>
                <SelectItem value="1">1 Adult</SelectItem>
                <SelectItem value="family">2 Adults, 2 Kids</SelectItem>
              </SelectContent>
            </Select>

            <Button
              asChild
              className="bg-[#C8102E] hover:bg-[#a00d24] text-white 
              text-sm font-medium px-6 py-2.5 
              hover:shadow-lg hover:shadow-[#C8102E]/25"
            >
              <Link href="/auth/register">
                Check Availability
              </Link>
            </Button>

          </div>
        </div>
      </div>
    </section>
  );
}