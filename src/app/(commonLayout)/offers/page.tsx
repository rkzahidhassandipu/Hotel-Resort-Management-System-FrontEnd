import React from 'react';
import Link from 'next/link';
import { Clock, Check, ArrowRight, Sparkles, Tag } from 'lucide-react';

const OFFERS = [
  { title: 'Honeymoon Escape', sub: 'Romance Package', tag: 'Romance', validity: 'Year-round', save: 'Save 20%', emoji: '💑', color: '#C8102E', bg: 'from-[#2a0810] to-[#0B0C10]', includes: ['3 Nights Premier Water Chalet', 'Champagne & tropical fruits', 'Daily breakfast for two', 'Romantic overwater dinner', 'Couple spa treatment (60 min)', 'Late checkout (subject to avail.)'], from: 'RM 1,980' },
  { title: 'Family Fun Package', sub: 'Family Holiday', tag: 'Family', validity: 'School holidays', save: 'Up to 30%', emoji: '👨‍👩‍👧‍👦', color: '#37EFD1', bg: 'from-[#051a15] to-[#0B0C10]', includes: ['4 Nights in Family Water Villa', 'Kids under 12 stay & eat FREE', 'Daily buffet breakfast', 'Non-motorised water sports', 'Kids club access (daily)', 'Family photo session'], from: 'RM 2,200' },
  { title: 'Weekend Getaway', sub: 'Short Stay Deal', tag: 'Weekend', validity: 'Every weekend', save: 'Save 15%', emoji: '🌅', color: '#C8102E', bg: 'from-[#0d1a2e] to-[#0B0C10]', includes: ['2 Nights (Fri check-in)', 'Daily breakfast included', 'Complimentary late checkout', 'Welcome cocktail on arrival', 'Complimentary Wi-Fi', 'All resort pools access'], from: 'RM 750' },
  { title: 'Stay More Save More', sub: 'Extended Stay', tag: '4+ Nights', validity: 'Year-round', save: 'Up to 25%', emoji: '🗓️', color: '#37EFD1', bg: 'from-[#1a0d2e] to-[#0B0C10]', includes: ['Minimum 4 nights stay', 'Daily breakfast all guests', 'One complimentary dinner', 'Airport transfer (return)', 'Laundry service (1 bag)', 'Priority room upgrade'], from: 'RM 700' },
  { title: 'Wellness Retreat', sub: 'Spa & Wellness', tag: 'Wellness', validity: 'Weekdays only', save: 'Save 20%', emoji: '🧘', color: '#C8102E', bg: 'from-[#0a1a20] to-[#0B0C10]', includes: ['3 Nights Pool Garden Villa', 'Daily spa session (60 min)', 'Healthy breakfast & dinner', 'Yoga class access', 'Meditation garden access', 'Detox welcome juice'], from: 'RM 1,350' },
  { title: 'Early Bird Offer', sub: 'Advance Booking', tag: '60 Days Ahead', validity: 'Year-round', save: 'Up to 35%', emoji: '⏰', color: '#37EFD1', bg: 'from-[#1a1205] to-[#0B0C10]', includes: ['All room categories', 'Daily breakfast for all', 'Complimentary room upgrade', 'Free cancellation (14 days)', 'Best rate guarantee', 'Loyalty points x2'], from: 'RM 600' },
];

export default function OffersPage() {
  return (
    <div className="bg-[#0B0C10] min-h-screen pt-24">
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1B21] to-[#0B0C10]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px] bg-[#C8102E]/8 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6">
          <p className="text-[#C8102E] text-[11px] font-sans tracking-[0.35em] uppercase mb-3 flex items-center gap-2">
            <span className="h-px w-8 bg-[#C8102E]" />Exclusive Deals
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-white mb-5">Special Offers</h1>
          <div className="flex items-center gap-2 text-[#37EFD1] text-sm font-sans">
            <Sparkles className="h-4 w-4" /> Best Rate Guaranteed When You Book Direct
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OFFERS.map(offer => (
              <div key={offer.title} className="group bg-[#1A1B21] border border-white/5 hover:border-[#C8102E]/25 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1">
                <div className={`h-40 relative flex items-center justify-center bg-gradient-to-br ${offer.bg}`}>
                  <span className="text-6xl opacity-20">{offer.emoji}</span>
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-sans uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: `${offer.color}20`, color: offer.color, border: `1px solid ${offer.color}30` }}>
                      {offer.sub}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-[#C8102E] text-white text-[10px] font-sans font-bold px-2.5 py-1 rounded-full">{offer.save}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-white/40" />
                    <span className="text-white/40 text-[10px] font-sans">{offer.validity}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-white text-xl font-semibold mb-1">{offer.title}</h3>
                  <p className="text-white/30 text-[10px] font-sans uppercase tracking-widest mb-4">{offer.tag}</p>
                  <ul className="space-y-1.5 mb-5">
                    {offer.includes.map(item => (
                      <li key={item} className="flex items-start gap-2 text-white/55 text-xs font-sans">
                        <Check className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: offer.color }} />{item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                      <p className="text-white/25 text-[9px] font-sans uppercase tracking-wider">Starting from</p>
                      <p className="font-display text-white text-lg font-semibold">{offer.from}<span className="text-white/30 text-xs font-sans font-normal">/night</span></p>
                    </div>
                    <Link href="/auth/register" className="flex items-center gap-1.5 text-sm font-sans font-medium px-4 py-2 rounded transition-all"
                      style={{ background: `${offer.color}15`, color: offer.color, border: `1px solid ${offer.color}30` }}>
                      Book <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/20 text-xs font-sans">* All offers subject to availability. Rates inclusive of service charge and SST. Book via official website for guaranteed best rates.</p>
        </div>
      </section>
    </div>
  );
}
