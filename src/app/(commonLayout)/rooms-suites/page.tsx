"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BedDouble,
  Users,
  Maximize,
  Check,
  ArrowRight,
  Lock,
} from "lucide-react";
import { roomService } from "@/service/room.service";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";

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
  status: string;
  color: string;
  emoji: string;
  amenities: string[];
  desc: string;
}

export default function RoomsSuitesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 6;
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();

  const {
    data: rooms,
    isLoading,
    isError,
  } = useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await roomService.getAll();
      return (res.data.data || []).map((r: any) => ({
        id: r.id,
        name: r.roomNumber,
        sub: r.category?.name || "",
        size: `${r.sizeInSqFt || 0} sqm`,
        guests: r.maxOccupancy,
        bed: r.bedType || "King",
        price: `RM ${r.category?.basePrice || 0}`,
        status: r.status,
        badge: r.status === "OCCUPIED" ? "Occupied" : null,
        color: r.color || "#37EFD1",
        emoji: r.emoji || "🏨",
        amenities: Array.isArray(r?.amenities)
          ? r.amenities.map((a: any) => a?.name ?? "Amenity")
          : [],
        desc: r.description || "No description available.",
      }));
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const handleViewDetails = (roomId: string) => {
    if (userLoading) return; // user load হওয়ার আগে click ignore করো
    if (user) {
      router.push(`/rooms-suites/${roomId}`);
    } else {
      router.push("/auth/register");
    }
  };

  // ── Loading ────────────────────────────────────────────────────
  if (isLoading || !rooms) {
    return (
      <div className="bg-[#0B0C10] min-h-screen pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#37EFD1]/30 border-t-[#37EFD1] rounded-full animate-spin" />
          <p className="text-white/40 font-sans text-sm tracking-widest uppercase">
            Loading rooms...
          </p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="bg-[#0B0C10] min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-[#C8102E] font-sans text-sm tracking-widest uppercase">
            Something went wrong
          </p>
          <p className="text-white/40 font-sans text-sm">
            Failed to load rooms. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // ── Derived data ───────────────────────────────────────────────
  const availableRooms = rooms.filter((room) => room.status === "AVAILABLE");
  const totalPages = Math.max(
    1,
    Math.ceil(availableRooms.length / roomsPerPage),
  );
  const startIndex = (currentPage - 1) * roomsPerPage;
  const currentRooms = availableRooms.slice(
    startIndex,
    startIndex + roomsPerPage,
  );

  // ── Empty ──────────────────────────────────────────────────────
  if (!availableRooms.length) {
    return (
      <div className="bg-[#0B0C10] min-h-screen pt-24 flex items-center justify-center">
        <p className="text-white/40 font-sans text-sm tracking-widest uppercase">
          No rooms available at this time.
        </p>
      </div>
    );
  }

  // ── Main ───────────────────────────────────────────────────────
  return (
    <div className="bg-[#0B0C10] min-h-screen pt-24">
      {/* Hero */}
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

          {/* Login nudge */}
          {!user && (
            <div className="mt-6 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5">
              <Lock className="h-3.5 w-3.5 text-[#37EFD1]" />
              <p className="text-white/50 text-xs font-sans">
                <span
                  onClick={() => router.push("/auth/register")}
                  className="text-[#37EFD1] underline underline-offset-2 cursor-pointer hover:text-[#37EFD1]/80 transition-colors"
                >
                  Sign in
                </span>{" "}
                to view room details and make a booking.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Perks */}
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

      {/* Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentRooms.map((room, index) => {
              const color = index % 2 === 0 ? "#C8102E" : "#37EFD1";
              return (
                <div
                  key={room.id}
                  className="group relative rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-500 shadow-sm bg-[#1A1B21]"
                >
                  {/* Card top */}
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

                  {/* Card body */}
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
                        <Maximize className="h-3 w-3" /> {room.size}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {room.guests} Guests
                      </span>
                      <span className="flex items-center gap-1">
                        <BedDouble className="h-3 w-3" /> {room.bed}
                      </span>
                    </div>

                    <p className="text-white/45 text-sm font-sans leading-relaxed mb-4">
                      {room.desc}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {room.amenities?.map((amenityName, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-sans bg-white/5 border border-white/8 text-white/50 px-2 py-0.5 rounded"
                        >
                          {amenityName}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleViewDetails(room.id)}
                      className="flex items-center gap-1.5 text-sm font-sans font-medium transition-all group-hover:gap-2.5"
                      style={{ color: user ? room.color : "#ffffff60" }}
                    >
                      {user ? (
                        <>
                          View Details <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" /> Sign in to View
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded bg-[#37EFD1]/20 text-white disabled:opacity-40 transition-opacity"
              >
                Previous
              </button>
              <span className="text-white/50 font-sans px-2 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded bg-[#C8102E]/20 text-white disabled:opacity-40 transition-opacity"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
