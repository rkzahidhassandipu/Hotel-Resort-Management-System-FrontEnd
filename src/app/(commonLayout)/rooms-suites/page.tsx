"use client";
import React from 'react';
import Link from 'next/link';
import { BedDouble, Users, Maximize, ChevronRight, Star, ArrowRight, Check } from 'lucide-react';

const ROOMS = [
  { name: 'Water Chalet', sub: 'Classic Overwater', size: '55 sqm', guests: 2, bed: 'King', price: 'RM 750', badge: null, color: '#37EFD1', emoji: '🏠', amenities: ['Private Deck', 'Sea View', 'Jacuzzi', 'King Bed', 'Mini Bar'], desc: 'Perched directly above the sea, our Water Chalets offer uninterrupted ocean panoramas with direct water access from your private sun deck.' },
  { name: 'Premier Water Chalet', sub: 'Elevated Overwater', size: '68 sqm', guests: 2, bed: 'King', price: 'RM 950', badge: 'Best Seller', color: '#C8102E', emoji: '🌊', amenities: ['Plunge Pool', 'Panoramic View', 'Butler Service', 'Separate Lounge'], desc: 'Elevated higher with expansive windows on three sides. Enjoy a private plunge pool and dedicated butler from sunrise to sunset.' },
  { name: 'Lexis Suite', sub: 'Signature Luxury', size: '120 sqm', guests: 2, bed: 'King', price: 'RM 1,800', badge: 'Featured', color: '#37EFD1', emoji: '✨', amenities: ['Private Pool', 'Sky Terrace', 'Full Butler', 'Premium Bar', 'Cinema'], desc: 'Two-level suites with rooftop terraces, private infinity pools, and panoramic 360-degree sea views that will leave you breathless.' },
  { name: 'Family Water Villa', sub: 'Family Retreat', size: '180 sqm', guests: 4, bed: '2 Kings', price: 'RM 2,200', badge: 'Family', color: '#C8102E', emoji: '👨‍👩‍👧‍👦', amenities: ['2 Bedrooms', 'Kids Pool', 'Game Room', 'Full Kitchen', 'Bunk Beds'], desc: 'Spacious two-bedroom villas designed for families, with a children\'s wading pool, game room, and connecting living spaces.' },
  { name: 'Pool Garden Villa', sub: 'Garden Sanctuary', size: '150 sqm', guests: 2, bed: 'King', price: 'RM 1,400', badge: null, color: '#37EFD1', emoji: '🌿', amenities: ['Private Garden', 'Infinity Pool', 'Outdoor Bath', 'Day Bed', 'Butler'], desc: 'Set within lush tropical gardens, these villas offer complete privacy with a secluded infinity pool and al fresco bathing.' },
  { name: 'Grand Presidential Suite', sub: 'Ultimate Indulgence', size: '350 sqm', guests: 4, bed: 'Emperor King', price: 'RM 5,500', badge: 'Exclusive', color: '#C8102E', emoji: '👑', amenities: ['3 Bedrooms', 'Private Dock', 'Personal Chef', 'Cinema Room', 'Yacht Access'], desc: 'The pinnacle of luxury — our largest suite with a private boat dock, personal chef, and dedicated concierge available 24/7.' },
];

const PERKS = ['Complimentary Wi-Fi', 'Daily Breakfast', 'Welcome Amenities', 'Turndown Service', '24h Butler (Suites)', 'Late Checkout'];

export default function RoomsSuitesPage() {
  return (
    <div className="bg-[#0B0C10] min-h-screen pt-24">
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1B21] to-[#0B0C10]" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(55,239,209,0.03) 0, rgba(55,239,209,0.03) 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-7xl mx-auto px-6">
          <p className="text-[#37EFD1] text-[11px] font-sans tracking-[0.35em] uppercase mb-3 flex items-center gap-2">
            <span className="h-px w-8 bg-[#37EFD1]" />Accommodations
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-white mb-5">Rooms & Suites</h1>
          <p className="text-white/50 font-sans max-w-xl leading-relaxed">
            Choose from 526 uniquely crafted water chalets, villas, and suites — each positioned to give you an unobstructed connection with the sea.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="py-8 bg-[#1A1B21] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-3 justify-center">
          {PERKS.map(p => (
            <span key={p} className="inline-flex items-center gap-1.5 bg-[#0B0C10] text-white/60 text-xs font-sans px-4 py-2 rounded-full border border-white/8">
              <Check className="h-3 w-3 text-[#37EFD1]" /> {p}
            </span>
          ))}
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROOMS.map(room => (
              <div key={room.name} className="group bg-[#1A1B21] border border-white/5 hover:border-[#C8102E]/25 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40">
                <div className="h-52 relative flex items-center justify-center overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${room.color}18, ${room.color}06, #0B0C10)` }}>
                  <span className="text-7xl opacity-15">{room.emoji}</span>
                  <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${room.color}60, transparent)` }} />
                  {room.badge && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-sans font-medium"
                      style={{ background: `${room.color}20`, color: room.color, border: `1px solid ${room.color}40` }}>
                      {room.badge}
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 text-right">
                    <p className="text-white/30 text-[8px] font-sans uppercase tracking-wider">from</p>
                    <p className="text-white font-display text-lg font-semibold">{room.price}</p>
                    <p className="text-white/30 text-[8px] font-sans">/ night</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[10px] font-sans tracking-widest uppercase mb-1" style={{ color: room.color }}>{room.sub}</p>
                  <h3 className="font-display text-white text-xl font-semibold mb-3">{room.name}</h3>
                  <div className="flex items-center gap-4 text-white/40 text-xs font-sans mb-3">
                    <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{room.size}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{room.guests} Guests</span>
                    <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{room.bed}</span>
                  </div>
                  <p className="text-white/45 text-sm font-sans leading-relaxed mb-4">{room.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {room.amenities.map(a => (
                      <span key={a} className="text-[10px] font-sans bg-white/5 border border-white/8 text-white/50 px-2 py-0.5 rounded">{a}</span>
                    ))}
                  </div>
                  <Link href={`/book/${encodeURIComponent(room.name)}`} className="flex items-center justify-center gap-2 text-sm font-sans font-medium py-2.5 rounded transition-all border"
                    style={{ background: `${room.color}12`, borderColor: `${room.color}30`, color: room.color }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${room.color}22`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${room.color}12`; }}>
                    Book This Room <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#1A1B21] border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-3xl text-white mb-3">Need Help Choosing?</h2>
          <p className="text-white/50 font-sans mb-8 text-sm">Our reservations team is available 24/7 to help you find the perfect room.</p>
          <a href="tel:+60-6-647-1188" className="inline-flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white font-sans font-medium px-8 py-3 rounded transition-all hover:shadow-lg hover:shadow-[#C8102E]/30 text-sm">
            Call +60 6-647 1188
          </a>
        </div>
      </section>
    </div>
  );
}
