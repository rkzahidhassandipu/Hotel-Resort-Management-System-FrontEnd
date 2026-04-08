'use client';
import Link from 'next/link';
import { ArrowRight, BedDouble, Utensils, Waves, Award, Calendar, ChevronRight, Star, Sparkles, MapPin } from 'lucide-react';
import HeroSlider from './HeroSlider';
import RoomSlider from './RoomSlider';
import TestimonialSlider from './TestimonialSlider';
import QuickBookingBar from '@/components/home/QuickBookingBar';
import Highlights from '@/components/home/Highlights';
import RoomsSection from '@/components/home/RoomsSection';
import OffersSection from '@/components/home/OffersSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CTASection from '@/components/home/CTASection';

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
     <QuickBookingBar />

      {/* Highlights Stats */}
      <Highlights />

      {/* Rooms Section */}
      <RoomsSection />

      {/* Offers Section */}
      <OffersSection />

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
      <TestimonialsSection />

      {/* CTA Section */}
     <CTASection />
    </div>
  );
}
