import React from 'react';
import Link from 'next/link';
import { Clock, MapPin, Phone, ChevronRight } from 'lucide-react';

const RESTAURANTS = [
  { name: 'Seahorse', type: 'Seafood & Grill', loc: 'Overwater Deck', hours: '12pm – 10:30pm', seats: 80, emoji: '🦞', color: '#37EFD1', bg: 'from-[#0d1a2e]', reservation: true, dresscode: 'Smart Casual', specials: ['Whole Grilled Red Snapper', 'Tiger Prawn Thermidor', 'Live Lobster Selection'], desc: 'Our signature overwater restaurant celebrates the bounty of the South China Sea. Daily fresh catches grilled to perfection with panoramic sunset views.' },
  { name: 'The Hibiscus', type: 'Malaysian & Asian', loc: 'Garden Terrace', hours: '7am – 11pm', seats: 120, emoji: '🍛', color: '#C8102E', bg: 'from-[#1a0810]', reservation: false, dresscode: 'Casual', specials: ['Nasi Kerabu Ayam', 'Laksa Johor', 'Teh Tarik & Kuih'], desc: 'A celebration of Malaysian heritage and neighbouring Asian cuisines. From nasi lemak to dim sum, every dish tells the story of the region\'s rich culinary culture.' },
  { name: 'Nautilus', type: 'Fine Dining', loc: 'Tower Level 12', hours: '6:30pm – 11pm', seats: 48, emoji: '🍷', color: '#37EFD1', bg: 'from-[#051a15]', reservation: true, dresscode: 'Smart Formal', specials: ['Wagyu Beef Tenderloin', 'Truffle Risotto', '7-Course Degustation'], desc: 'Award-winning fine dining 12 floors above the sea. Contemporary cuisine with European influence and the finest imported ingredients.' },
  { name: 'The Deck', type: 'International Buffet', loc: 'Pool Level', hours: '7am – 10pm', seats: 200, emoji: '🍽️', color: '#C8102E', bg: 'from-[#1a0d2e]', reservation: false, dresscode: 'Casual', specials: ['Live Carving Station', 'International Breakfast Buffet', 'Seafood Dinner Spread'], desc: 'A lively open-air restaurant with international buffet spreads. Live cooking stations bring the theatre of food to your table across all meals.' },
  { name: 'Reef Bar & Lounge', type: 'Bar & Cocktails', loc: "Water's Edge", hours: '11am – 1am', seats: 60, emoji: '🍹', color: '#37EFD1', bg: 'from-[#1a1205]', reservation: false, dresscode: 'Casual', specials: ['Signature Hibiscus Cocktail', 'Tapas Menu', 'Live DJ (Fri–Sat)'], desc: 'Perched at the water\'s edge, Reef Bar is the resort\'s social heartbeat. Crafted cocktails, imported spirits, and light bites with the soundtrack of lapping waves.' },
  { name: 'Palapa Poolside', type: 'Snacks & Light Bites', loc: 'Main Pool', hours: '10am – 6pm', seats: 40, emoji: '☀️', color: '#C8102E', bg: 'from-[#0a1a20]', reservation: false, dresscode: 'Resort Casual', specials: ['Açaí Smoothie Bowl', 'Club Sandwich', 'Nachos & Dips'], desc: 'Your poolside companion serving refreshing drinks, tropical smoothies, sandwiches, and local snacks. Perfect for a lazy afternoon under the Malaysian sun.' },
];

export default function DiningPage() {
  return (
    <div className="bg-[#0B0C10] min-h-screen pt-24">
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1B21] to-[#0B0C10]" />
        <div className="relative max-w-7xl mx-auto px-6">
          <p className="text-[#C8102E] text-[11px] font-sans tracking-[0.35em] uppercase mb-3 flex items-center gap-2">
            <span className="h-px w-8 bg-[#C8102E]" />Culinary Journey
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-white mb-5">Dining</h1>
          <p className="text-white/50 font-sans max-w-xl leading-relaxed">
            Six restaurants and bars, each with a distinct identity — from overwater seafood dinners to poolside cocktails.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          {RESTAURANTS.map((r, i) => (
            <div key={r.name} className={`group bg-[#1A1B21] border border-white/5 hover:border-[#C8102E]/20 rounded-xl overflow-hidden transition-all flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              <div className={`md:w-72 flex-shrink-0 h-52 md:h-auto flex items-center justify-center text-6xl relative bg-gradient-to-br ${r.bg} to-[#0B0C10]`}>
                <span className="opacity-20">{r.emoji}</span>
                <div className="absolute bottom-3 left-3">
                  <span className="text-[9px] font-sans bg-white/10 text-white/60 px-2 py-0.5 rounded-full backdrop-blur-sm">{r.dresscode}</span>
                </div>
              </div>
              <div className="flex-1 p-7">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-[10px] font-sans uppercase tracking-widest mb-1" style={{ color: r.color }}>{r.type}</p>
                    <h3 className="font-display text-white text-2xl font-semibold">{r.name}</h3>
                  </div>
                  {r.reservation && (
                    <span className="text-[9px] bg-[#C8102E]/10 text-[#C8102E] font-sans px-2.5 py-1 rounded-full border border-[#C8102E]/20 whitespace-nowrap">
                      Reservation Required
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-white/35 text-xs font-sans mb-4">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.loc}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.hours}</span>
                  <span>{r.seats} seats</span>
                </div>
                <p className="text-white/50 font-sans text-sm leading-relaxed mb-4">{r.desc}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {r.specials.map(s => (
                    <span key={s} className="text-[10px] font-sans bg-white/5 border border-white/8 text-white/50 px-2.5 py-1 rounded-full">⭑ {s}</span>
                  ))}
                </div>
                {r.reservation && (
                  <Link href="/auth/register" className="inline-flex items-center gap-1.5 text-sm font-sans font-medium transition-all" style={{ color: r.color }}>
                    Reserve a Table <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 bg-[#1A1B21] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="font-display text-2xl text-white mb-3">Dietary Accommodations</h3>
          <p className="text-white/40 font-sans max-w-lg mx-auto text-sm mb-6">We cater for all dietary requirements with advance notice. Please inform us upon booking.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Halal Certified', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Nut-Free', 'Diabetic-Friendly'].map(d => (
              <span key={d} className="bg-[#37EFD1]/8 text-[#37EFD1]/80 text-xs font-sans px-4 py-2 rounded-full border border-[#37EFD1]/20">{d}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
