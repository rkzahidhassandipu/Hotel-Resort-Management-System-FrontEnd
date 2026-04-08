"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Maximize,
  ArrowRight,
} from "lucide-react";
import { roomService } from "@/service/room.service";

interface Room {
  id: string;
  name: string;
  sub: string;
  size: string;
  guests: number;
  price: string;
  from: string;
  color: string;
  emoji: string;
  badge?: string | null;
}

export default function RoomSlider() {
  const [active, setActive] = useState(0);

  const {
    data: rooms = [],
    isLoading,
    isError,
  } = useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await roomService.getAll();
      return res.data.data.map((r: any) => ({
        id: r.id,
        name: r.roomNumber,
        sub: r.category?.name || "",
        size: `${r.sizeInSqFt || 0} sq.ft`,
        guests: r.maxOccupancy,
        price: `$${r.category?.basePrice || 0}`,
        from: "per night",
        color: "#C8102E",
        emoji: "🏨",
        badge: r.status === "OCCUPIED" ? "Occupied" : null,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading)
    return <p className="text-white text-center">Loading rooms...</p>;
  if (isError || !rooms.length)
    return <p className="text-white text-center">No rooms available</p>;

  const prev = () => setActive((a) => (a - 1 + rooms.length) % rooms.length);
  const next = () => setActive((a) => (a + 1) % rooms.length);

  const visibleRooms = [
    rooms[(active - 1 + rooms.length) % rooms.length],
    rooms[active],
    rooms[(active + 1) % rooms.length],
  ];

  // ── Pagination dots helper ───────────────────────
  const getVisibleDots = (
    total: number,
    active: number,
    maxDots: number = 5,
  ) => {
    const dots = [];
    if (total <= maxDots) {
      for (let i = 0; i < total; i++) dots.push(i);
    } else {
      let start = Math.max(0, active - Math.floor(maxDots / 2));
      let end = start + maxDots;

      if (end > total) {
        end = total;
        start = total - maxDots;
      }

      for (let i = start; i < end; i++) dots.push(i);
    }
    return dots;
  };

  return (
    <div className="relative">
      {/* Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {visibleRooms.map((room, idx) => {
          const isCenter = idx === 1;
          return (
            <div
              key={room.id}
              className={`group relative rounded-xl overflow-hidden border transition-all duration-500
                ${
                  isCenter
                    ? "border-[#C8102E]/30 shadow-2xl shadow-[#C8102E]/10 scale-100"
                    : "border-white/5 opacity-70 hover:opacity-90 scale-95"
                }
                bg-[#1A1B21]`}
            >
              {/* Image / Emoji */}
              <div
                className="h-52 relative flex items-center justify-center overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${room.color}22, ${room.color}08, #0B0C10)`,
                }}
              >
                <span className="text-7xl opacity-20">{room.emoji}</span>
                {room.badge && (
                  <div
                    className="absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-sans font-medium"
                    style={{
                      background: `${room.color}22`,
                      color: room.color,
                      border: `1px solid ${room.color}40`,
                    }}
                  >
                    {room.badge}
                  </div>
                )}
                <div className="absolute bottom-3 right-3 text-right">
                  <p className="text-white/40 text-[9px] font-sans uppercase tracking-wider">
                    from
                  </p>
                  <p className="text-white font-display text-lg font-semibold">
                    {room.price}
                  </p>
                  <p className="text-white/40 text-[9px] font-sans">
                    {room.from}
                  </p>
                </div>
              </div>

              {/* Room Info */}
              <div className="p-5">
                <p
                  className="text-[10px] font-sans tracking-widest uppercase mb-1"
                  style={{ color: room.color }}
                >
                  {room.sub}
                </p>
                <h3 className="font-display text-white text-lg font-semibold mb-3">
                  {room.name}
                </h3>
                <div className="flex items-center gap-4 text-white/40 text-xs font-sans mb-4">
                  <span className="flex items-center gap-1">
                    <Maximize className="h-3 w-3" />
                    {room.size}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {room.guests} Guests
                  </span>
                </div>
                <Link
                  href={`/rooms-suites/${room.id}`}
                  className="flex items-center gap-1.5 text-sm font-sans font-medium transition-all group-hover:gap-2.5"
                  style={{ color: room.color }}
                >
                  View Details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation with 5-dot pagination */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full border border-white/10 hover:border-[#C8102E]/50 flex items-center justify-center text-white/50 hover:text-white transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex gap-2">
          {getVisibleDots(rooms.length, active).map((i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-3 h-3 rounded-full ${i === active ? "bg-[#C8102E]" : "bg-white/20"} transition-all`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-10 h-10 rounded-full border border-white/10 hover:border-[#C8102E]/50 flex items-center justify-center text-white/50 hover:text-white transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
