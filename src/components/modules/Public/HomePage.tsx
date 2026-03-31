'use client';
import Link from 'next/link';
import { ArrowRight, BedDouble, Utensils, Waves, Award, Calendar, ChevronRight, Star, Sparkles, MapPin } from 'lucide-react';
import HeroSlider from './HeroSlider';
import RoomSlider from './RoomSlider';
import TestimonialSlider from './TestimonialSlider';

const HIGHLIGHTS = [
  { icon: BedDouble, label: '526 Rooms', sub: 'Water chalets & villas', col: '#37EFD1' },
  { icon: Utensils,  label: '6 Restaurants', sub: 'World-class dining', col: '#C8102E' },
  { icon: Waves,    label: '160m Pool', sub: 'Longest overwater pool', col: '#37EFD1' },
  { icon: Award,    label: 'Award Winning', sub: 'Regional luxury resort', col: '#C8102E' },
];

const OFFERS = [
  { title: 'Honeymoon Escape', badge: 'Romance', save: 'Save 20%', desc: 'Romantic overwater stay with champagne breakfast & couple spa.', color: '#C8102E' },
  { title: 'Family Fun Package', badge: 'Family', save: 'Up to 30% Off', desc: 'Kids stay & eat free. Water sports and pool activities included.', color: '#37EFD1' },
  { title: 'Early Bird Offer', badge: 'Advance', save: 'Up to 35% Off', desc: 'Book 60 days ahead for the deepest discounts and complimentary upgrade.', color: '#C8102E' },
];

const DINING = [
  { name: 'Seahorse', type: 'Seafood & Grill', location: 'Overwater Deck', emoji: '🦞', reservation: true },
  { name: 'The Hibiscus', type: 'Malaysian & Asian', location: 'Garden Terrace', emoji: '🍛', reservation: false },
  { name: 'Nautilus', type: 'Fine Dining', location: 'Tower Level 12', emoji: '🍷', reservation: true },
  { name: 'Reef Bar', type: 'Bar & Cocktails', location: "Water's Edge", emoji: '🍹', reservation: false },
];

export default function HomePage() {
  return (
    <div className="bg-[#0B0C10] min-h-screen">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Quick Booking Bar */}
      <section className="bg-[#1A1B21] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#C8102E]" />
              <span className="text-white font-sans text-sm font-medium">Quick Booking</span>
            </div>
            <div className="flex flex-wrap gap-3 flex-1 justify-end">
              <input type="date" className="bg-[#0B0C10] text-white/70 text-sm font-sans px-4 py-2.5 rounded border border-white/10 focus:outline-none focus:border-[#37EFD1]/50 transition-colors" />
              <input type="date" className="bg-[#0B0C10] text-white/70 text-sm font-sans px-4 py-2.5 rounded border border-white/10 focus:outline-none focus:border-[#37EFD1]/50 transition-colors" />
              <select className="bg-[#0B0C10] text-white/70 text-sm font-sans px-4 py-2.5 rounded border border-white/10 focus:outline-none focus:border-[#37EFD1]/50 transition-colors">
                <option>2 Adults</option><option>1 Adult</option><option>2 Adults, 2 Kids</option>
              </select>
              <Link href="/auth/register" className="bg-[#C8102E] hover:bg-[#a00d24] text-white text-sm font-sans font-medium px-6 py-2.5 rounded transition-all hover:shadow-lg hover:shadow-[#C8102E]/25 whitespace-nowrap">
                Check Availability
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Stats */}
      <section className="py-16 bg-[#0B0C10]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-xl overflow-hidden">
            {HIGHLIGHTS.map(({ icon: Icon, label, sub, col }) => (
              <div key={label} className="bg-[#0B0C10] p-8 text-center group hover:bg-[#1A1B21] transition-colors">
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ background: `${col}15`, border: `1px solid ${col}30` }}>
                  <Icon className="h-5 w-5" style={{ color: col }} />
                </div>
                <p className="font-display text-xl text-white font-semibold mb-1">{label}</p>
                <p className="text-white/40 text-xs font-sans">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="py-20 bg-[#0B0C10]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[#37EFD1] text-[11px] font-sans tracking-[0.35em] uppercase mb-3">Accommodations</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">Rooms & Suites</h2>
            <div className="divider-crimson mx-auto mb-5" />
            <p className="text-white/50 font-sans max-w-lg mx-auto">
              526 uniquely crafted water chalets, villas, and suites — each positioned above the shimmering South China Sea.
            </p>
          </div>
          <RoomSlider />
          <div className="text-center mt-10">
            <Link href="/rooms-suites" className="inline-flex items-center gap-2 border border-white/15 hover:border-[#C8102E]/60 text-white hover:text-[#C8102E] font-sans font-medium px-8 py-3 rounded transition-all text-sm">
              View All Rooms <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="py-20 bg-[#1A1B21]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[#C8102E] text-[11px] font-sans tracking-[0.35em] uppercase mb-3">Exclusive Deals</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">Special Offers</h2>
            <div className="divider-crimson mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OFFERS.map(offer => (
              <div key={offer.title} className="group relative border rounded-xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 bg-[#0B0C10] border-white/5 hover:border-[#C8102E]/25 hover:shadow-xl hover:shadow-[#C8102E]/5">
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${offer.color}60, transparent)` }} />
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[10px] font-sans uppercase tracking-widest px-2.5 py-1 rounded-full border"
                    style={{ color: offer.color, borderColor: `${offer.color}30`, background: `${offer.color}10` }}>
                    {offer.badge}
                  </span>
                  <span className="text-xs font-sans font-semibold px-2.5 py-1 rounded bg-[#C8102E] text-white">{offer.save}</span>
                </div>
                <h3 className="font-display text-white text-xl mb-2">{offer.title}</h3>
                <p className="text-white/50 text-sm font-sans leading-relaxed mb-5">{offer.desc}</p>
                <Link href="/offers" className="flex items-center gap-1.5 text-sm font-sans font-medium transition-all group-hover:gap-2.5" style={{ color: offer.color }}>
                  Learn More <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/offers" className="inline-flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white font-sans font-medium px-8 py-3 rounded transition-all hover:shadow-lg hover:shadow-[#C8102E]/30 text-sm">
              All Offers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Dining Section */}
      <section className="py-20 bg-[#0B0C10]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#37EFD1] text-[11px] font-sans tracking-[0.35em] uppercase mb-3">Culinary Journey</p>
              <h2 className="font-display text-4xl md:text-5xl text-white mb-4">World-Class Dining</h2>
              <div className="divider-crimson mb-6" />
              <p className="text-white/55 font-sans leading-relaxed mb-4">
                Six distinctive restaurants offer authentic Malaysian cuisine, fresh seafood, and international flavours — all with breathtaking sea views.
              </p>
              <p className="text-white/55 font-sans leading-relaxed mb-8">
                From candlelit overwater dinners to poolside cocktails — every meal is an occasion at Lexis Hibiscus.
              </p>
              <Link href="/dining" className="inline-flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white font-sans font-medium px-7 py-3 rounded transition-all hover:shadow-lg hover:shadow-[#C8102E]/30 text-sm">
                Discover Dining <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {DINING.map(r => (
                <div key={r.name} className="group bg-[#1A1B21] border border-white/5 hover:border-[#37EFD1]/20 rounded-xl p-5 transition-all hover:-translate-y-0.5">
                  <div className="text-3xl mb-3">{r.emoji}</div>
                  <p className="font-display text-white font-semibold text-base mb-0.5">{r.name}</p>
                  <p className="text-white/40 text-xs font-sans mb-1">{r.type}</p>
                  <div className="flex items-center gap-1 text-[#37EFD1]/60 text-[10px] font-sans mt-2">
                    <MapPin className="h-2.5 w-2.5" /> {r.location}
                  </div>
                  {r.reservation && (
                    <div className="mt-2 text-[9px] font-sans text-[#C8102E]/80 border border-[#C8102E]/15 px-2 py-0.5 rounded-full inline-block">
                      Reservation Required
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#1A1B21]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[#C8102E] text-[11px] font-sans tracking-[0.35em] uppercase mb-3">Guest Stories</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">What Our Guests Say</h2>
            <div className="divider-crimson mx-auto" />
          </div>
          <TestimonialSlider />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-[#0B0C10] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] bg-[#C8102E]/8" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8102E]/30 to-transparent" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Sparkles className="h-8 w-8 text-[#37EFD1] mx-auto mb-6 animate-float" />
          <h2 className="font-display text-4xl md:text-5xl text-white mb-5">Ready for Your Dream Escape?</h2>
          <p className="text-white/55 font-sans mb-10 leading-relaxed text-lg">
            Book directly for the best rates, complimentary breakfast, and exclusive member benefits unavailable anywhere else.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/auth/register" className="bg-[#C8102E] hover:bg-[#a00d24] text-white font-sans font-medium px-10 py-4 rounded transition-all hover:shadow-2xl hover:shadow-[#C8102E]/30 text-sm">
              Book Your Stay
            </Link>
            <Link href="/facilities" className="border border-white/15 hover:border-[#37EFD1]/40 hover:text-[#37EFD1] text-white font-sans font-medium px-10 py-4 rounded transition-all text-sm">
              Explore Facilities
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
