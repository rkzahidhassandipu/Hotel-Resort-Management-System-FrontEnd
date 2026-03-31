import React from 'react';
import Link from 'next/link';
import { Clock, Waves, Sparkles, Music, Users, ChevronRight } from 'lucide-react';

const FACILITIES = [
  {
    category: 'Water & Recreation', icon: Waves, color: '#37EFD1',
    items: [
      { name: 'Infinity Pool', emoji: '🏊', hours: '7am – 10pm', highlight: '160m long', tag: 'Iconic', desc: "Malaysia's longest overwater infinity pool stretching 160m, blending seamlessly with the sea horizon at sunset." },
      { name: 'Water Sports Centre', emoji: '🏄', hours: '8am – 6pm', highlight: '12+ Activities', tag: null, desc: 'Jet skiing, kayaking, banana boats, parasailing, and snorkelling — all managed by certified instructors.' },
      { name: 'Kids Splash Zone', emoji: '🎠', hours: '8am – 7pm', highlight: 'Ages 2–12', tag: 'Family', desc: 'Dedicated water play area with safe shallow pools, water slides, and interactive splash features.' },
    ],
  },
  {
    category: 'Wellness & Spa', icon: Sparkles, color: '#C8102E',
    items: [
      { name: 'Angsana Spa', emoji: '🧖', hours: '9am – 10pm', highlight: '30+ Treatments', tag: 'Award Winning', desc: 'An award-winning spa offering over 30 treatments rooted in traditional Asian healing. Private overwater treatment villas.' },
      { name: 'Fitness Centre', emoji: '🏋️', hours: '6am – 11pm', highlight: '24/7 Key Access', tag: null, desc: 'State-of-the-art equipment, personal training sessions, aerobics classes, and sea-view cardio machines.' },
      { name: 'Yoga Pavilion', emoji: '🧘', hours: 'Classes 7am & 5pm', highlight: 'Daily Classes', tag: null, desc: 'An open-air pavilion perched over the water — the perfect backdrop for sunrise yoga and guided meditation.' },
    ],
  },
  {
    category: 'Entertainment & Events', icon: Music, color: '#37EFD1',
    items: [
      { name: 'Grand Ballroom', emoji: '🎊', hours: 'By arrangement', highlight: '1,200 capacity', tag: 'Events', desc: 'A 1,200-capacity grand ballroom for weddings, galas, and corporate events with full AV and lighting.' },
      { name: 'Kids Club', emoji: '🎨', hours: '9am – 7pm', highlight: 'Ages 4–12', tag: 'Family', desc: 'Supervised daily programmes including arts & crafts, cooking workshops, beach games, and movie nights.' },
      { name: 'Beach & Marina', emoji: '⛵', hours: 'Sunrise – Sunset', highlight: 'Private beach', tag: null, desc: 'Private beach access with sunloungers. Marina facilities for private yacht docking and sunset cruises.' },
    ],
  },
  {
    category: 'Business & Connectivity', icon: Users, color: '#C8102E',
    items: [
      { name: 'Business Centre', emoji: '💼', hours: '8am – 8pm', highlight: '8 meeting rooms', tag: 'Business', desc: 'Fully equipped meeting rooms, high-speed internet, printing services, and dedicated event coordination staff.' },
      { name: 'Complimentary Wi-Fi', emoji: '📶', hours: '24/7', highlight: 'Resort-wide', tag: null, desc: 'High-speed fibre Wi-Fi throughout the resort — all rooms, public areas, and overwater chalets.' },
      { name: 'Concierge Desk', emoji: '🛎️', hours: '24/7', highlight: 'Always available', tag: null, desc: 'Our experienced concierge team handles everything from restaurant bookings to private island excursions.' },
    ],
  },
];

export default function FacilitiesPage() {
  return (
    <div className="bg-[#0B0C10] min-h-screen pt-24">
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1B21] to-[#0B0C10]" />
        <div className="relative max-w-7xl mx-auto px-6">
          <p className="text-[#37EFD1] text-[11px] font-sans tracking-[0.35em] uppercase mb-3 flex items-center gap-2">
            <span className="h-px w-8 bg-[#37EFD1]" />World-Class Amenities
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-white mb-5">Facilities</h1>
          <p className="text-white/50 font-sans max-w-xl leading-relaxed">
            From Malaysia's longest overwater infinity pool to an award-winning spa — every amenity is crafted to elevate your stay.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#1A1B21] border-y border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: '160m', label: 'Infinity Pool' },
            { val: '30+', label: 'Spa Treatments' },
            { val: '12+', label: 'Water Sports' },
            { val: '6', label: 'F&B Outlets' },
          ].map(s => (
            <div key={s.label}>
              <p className="font-display text-3xl text-[#37EFD1] font-bold">{s.val}</p>
              <p className="text-white/40 text-xs font-sans mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Facility Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          {FACILITIES.map(({ category, icon: Icon, color, items }) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-white">{category}</h2>
                  <div className="h-px w-12 mt-1 rounded-full" style={{ background: color }} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {items.map(item => (
                  <div key={item.name} className="group bg-[#1A1B21] border border-white/5 hover:border-[#C8102E]/20 rounded-xl p-6 transition-all hover:-translate-y-0.5">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{item.emoji}</span>
                      {item.tag && (
                        <span className="text-[9px] font-sans uppercase tracking-wider bg-white/5 border border-white/10 text-white/40 px-2 py-0.5 rounded-full">{item.tag}</span>
                      )}
                    </div>
                    <h3 className="font-display text-white text-lg font-semibold mb-2">{item.name}</h3>
                    <p className="text-white/45 text-sm font-sans leading-relaxed mb-4">{item.desc}</p>
                    <div className="flex items-center justify-between text-xs font-sans pt-3 border-t border-white/5">
                      <span className="flex items-center gap-1 text-white/30">
                        <Clock className="h-3 w-3" /> {item.hours}
                      </span>
                      <span className="font-medium" style={{ color }}>{item.highlight}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="py-16 bg-[#1A1B21] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#37EFD1] text-[11px] font-sans tracking-[0.35em] uppercase mb-3">Getting Here</p>
            <h2 className="font-display text-3xl text-white mb-4">Resort Location</h2>
            <div className="h-px w-12 bg-gradient-to-r from-[#C8102E] to-[#37EFD1] mb-6 rounded-full" />
            <p className="text-white/50 font-sans text-sm leading-relaxed mb-6">
              Nestled along Batu 3, Port Dickson — just 90 minutes from Kuala Lumpur city centre and 75 minutes from KLIA.
            </p>
            <ul className="space-y-3 text-white/55 text-sm font-sans">
              <li>🚗 90 min from Kuala Lumpur (PLUS Highway)</li>
              <li>✈️ 75 min from KLIA / KLIA2</li>
              <li>🚌 Shuttle service available on request</li>
            </ul>
          </div>
          <div className="bg-[#0B0C10] border border-white/5 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">📍</div>
            <p className="font-display text-white text-lg mb-1">Lexis Hibiscus Port Dickson</p>
            <p className="text-white/35 text-sm font-sans mb-6 leading-relaxed">Jalan Persiaran Taman Samudera, Batu 3,<br />71050 Port Dickson, Negeri Sembilan</p>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white text-sm font-sans font-medium px-6 py-2.5 rounded transition-all">
              Get Directions <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
