"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BedDouble, Users, Maximize, ChevronRight, Check, ArrowRight } from "lucide-react";
import { roomService } from "@/service/room.service";

const PERKS = [
  "Complimentary Wi-Fi",
  "Daily Breakfast",
  "Welcome Amenities",
  "Turndown Service",
  "24h Butler (Suites)",
  "Late Checkout",
];

interface Room {
  id: string;
  name: string;
  sub: string;
  size: string;
  guests: number;
  bed: string;
  price: string;
  badge?: string | null;
  color: string;
  emoji: string;
  amenities: string[];
  desc: string;
}

export default function RoomsSuitesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 3;

  const { data: rooms = [], isLoading, isError } = useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await roomService.getAll();
      return res.data.data.map((r: any) => ({
        id: r.id,
        name: r.roomNumber,
        sub: r.category?.name || "",
        size: `${r.sizeInSqFt || 0} sqm`,
        guests: r.maxOccupancy,
        bed: r.bedType || "King",
        price: `RM ${r.category?.basePrice || 0}`,
        badge: r.status === "OCCUPIED" ? "Occupied" : r.badge || null,
        color: r.color || "#37EFD1",
        emoji: r.emoji || "🏨",
        amenities: r?.amenities || [],
        desc: r.description || "No description available.",
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading)
    return <p className="text-white text-center mt-20">Loading rooms...</p>;
  if (isError)
    return <p className="text-white text-center mt-20">Failed to load rooms.</p>;
  if (!rooms.length)
    return <p className="text-white text-center mt-20">No rooms available.</p>;

  const totalPages = Math.ceil(rooms.length / roomsPerPage);
  const startIndex = (currentPage - 1) * roomsPerPage;
  const currentRooms = rooms.slice(startIndex, startIndex + roomsPerPage);

  return (
    <div className="bg-[#0B0C10] min-h-screen pt-24">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1B21] to-[#0B0C10]" />
        <div className="relative max-w-7xl mx-auto px-6">
          <p className="text-[#37EFD1] text-[11px] font-sans tracking-[0.35em] uppercase mb-3 flex items-center gap-2">
            <span className="h-px w-8 bg-[#37EFD1]" />
            Accommodations
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-white mb-5">
            Rooms & Suites
          </h1>
          <p className="text-white/50 font-sans max-w-xl leading-relaxed">
            Choose from our uniquely crafted water chalets, villas, and suites —
            each positioned to give you an unobstructed connection with the sea.
          </p>
        </div>
      </section>

      {/* Perks Section */}
      <section className="py-8 bg-[#1A1B21] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-3 justify-center">
          {PERKS.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-1.5 bg-[#0B0C10] text-white/60 text-xs font-sans px-4 py-2 rounded-full border border-white/8"
            >
              <Check className="h-3 w-3 text-[#37EFD1]" /> {p}
            </span>
          ))}
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentRooms.map((room, index) => {
              const color = index % 2 === 0 ? "#C8102E" : "#37EFD1";
              return (
                <div
                  key={room.id}
                  className="group relative rounded-xl overflow-hidden border border-white/5 hover:border-opacity-50 transition-all duration-500 shadow-sm hover:shadow-black/10 bg-[#1A1B21]"
                >
                  {/* Emoji / Image */}
                  <div
                    className="h-52 relative flex items-center justify-center overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${color}22, ${color}08, #0B0C10)`,
                    }}
                  >
                    <span className="text-7xl opacity-20">{room.emoji}</span>
                    {room.badge && (
                      <div
                        className="absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-sans font-medium"
                        style={{
                          background: `${color}22`,
                          color: color,
                          border: `1px solid ${color}40`,
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
                        / night
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <p
                      className="text-[10px] font-sans tracking-widest uppercase mb-1"
                      style={{ color }}
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
                      <span className="flex items-center gap-1">
                        <BedDouble className="h-3 w-3" />
                        {room.bed}
                      </span>
                    </div>
                    <p className="text-white/45 text-sm font-sans leading-relaxed mb-4">
                      {room.desc}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {(room.amenities || []).map((a) => (
                        <span
                          key={a}
                          className="text-[10px] font-sans bg-white/5 border border-white/8 text-white/50 px-2 py-0.5 rounded"
                        >
                          {a}
                        </span>
                      ))}
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

          {/* Pagination Controls */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded bg-[#37EFD1]/20 text-white disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-white/50 font-sans px-2 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded bg-[#C8102E]/20 text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}