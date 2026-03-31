'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Users, Maximize, ArrowRight } from 'lucide-react';

const ROOMS = [
  { name: 'Water Chalet', sub: 'Classic Overwater', size: '55 sqm', guests: 2, price: 'RM 750', from: 'per night', color: '#37EFD1', emoji: '🏠', badge: null },
  { name: 'Premier Water Chalet', sub: 'Elevated Experience', size: '68 sqm', guests: 2, price: 'RM 950', from: 'per night', color: '#C8102E', emoji: '🌊', badge: 'Best Seller' },
  { name: 'Lexis Suite', sub: 'Signature Luxury', size: '120 sqm', guests: 2, price: 'RM 1,800', from: 'per night', color: '#37EFD1', emoji: '✨', badge: 'Featured' },
  { name: 'Family Water Villa', sub: 'Family Retreat', size: '180 sqm', guests: 4, price: 'RM 2,200', from: 'per night', color: '#C8102E', emoji: '👨‍👩‍👧‍👦', badge: 'Family' },
  { name: 'Pool Garden Villa', sub: 'Garden Sanctuary', size: '150 sqm', guests: 2, price: 'RM 1,400', from: 'per night', color: '#37EFD1', emoji: '🌿', badge: null },
  { name: 'Grand Presidential', sub: 'Ultimate Indulgence', size: '350 sqm', guests: 4, price: 'RM 5,500', from: 'per night', color: '#C8102E', emoji: '👑', badge: 'Exclusive' },
];

export default function RoomSlider() {
  const [active, setActive] = useState(0);
  const prev = () => setActive(a => (a - 1 + ROOMS.length) % ROOMS.length);
  const next = () => setActive(a => (a + 1) % ROOMS.length);

  const visible = [
    ROOMS[(active - 1 + ROOMS.length) % ROOMS.length],
    ROOMS[active],
    ROOMS[(active + 1) % ROOMS.length],
  ];

  return (
    <div className="relative">
      {/* Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {visible.map((room, idx) => {
          const isCenter = idx === 1;
          return (
            <div key={`${room.name}-${idx}`}
              className={`group relative rounded-xl overflow-hidden border transition-all duration-500 ${
                isCenter
                  ? 'border-[#C8102E]/30 shadow-2xl shadow-[#C8102E]/10 scale-100'
                  : 'border-white/5 opacity-70 hover:opacity-90 scale-95 md:scale-95'
              } bg-[#1A1B21]`}>

              {/* Visual */}
              <div className="h-52 relative flex items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${room.color}22, ${room.color}08, #0B0C10)` }}>
                <span className="text-7xl opacity-20">{room.emoji}</span>
                {/* Decorative line */}
                <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${room.color}, transparent)` }} />
                {room.badge && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-sans font-medium"
                    style={{ background: `${room.color}22`, color: room.color, border: `1px solid ${room.color}40` }}>
                    {room.badge}
                  </div>
                )}
                <div className="absolute bottom-3 right-3 text-right">
                  <p className="text-white/40 text-[9px] font-sans uppercase tracking-wider">from</p>
                  <p className="text-white font-display text-lg font-semibold">{room.price}</p>
                  <p className="text-white/40 text-[9px] font-sans">{room.from}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <p className="text-[10px] font-sans tracking-widest uppercase mb-1" style={{ color: room.color }}>{room.sub}</p>
                <h3 className="font-display text-white text-lg font-semibold mb-3">{room.name}</h3>
                <div className="flex items-center gap-4 text-white/40 text-xs font-sans mb-4">
                  <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{room.size}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{room.guests} Guests</span>
                </div>
                <Link href="/rooms-suites"
                  className="flex items-center gap-1.5 text-sm font-sans font-medium transition-all group-hover:gap-2.5"
                  style={{ color: room.color }}>
                  View Details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button onClick={prev} className="w-10 h-10 rounded-full border border-white/10 hover:border-[#C8102E]/50 flex items-center justify-center text-white/50 hover:text-white transition-all">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-2">
          {ROOMS.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-300 ${i === active ? 'w-6 h-1.5 bg-[#C8102E]' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'}`} />
          ))}
        </div>
        <button onClick={next} className="w-10 h-10 rounded-full border border-white/10 hover:border-[#C8102E]/50 flex items-center justify-center text-white/50 hover:text-white transition-all">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
