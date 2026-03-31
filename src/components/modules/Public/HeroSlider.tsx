'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    tagline: 'Overwater Sanctuary',
    headline: 'Where the Sea\nMeets Luxury',
    sub: 'Wake up above the South China Sea in our iconic water chalets — 526 exclusive sanctuaries crafted for the discerning traveller.',
    cta: 'Explore Rooms',
    href: '/rooms-suites',
    accent: 'Premier Water Chalets from RM 950/night',
    bg: 'from-[#0B0C10] via-[#0d1a2e] to-[#0B0C10]',
    highlight: '#37EFD1',
  },
  {
    id: 2,
    tagline: 'Culinary Excellence',
    headline: 'Six Restaurants,\nOne Sea View',
    sub: 'From overwater candlelit dinners at Seahorse to craft cocktails at Reef Bar — every meal is an occasion with the ocean as your backdrop.',
    cta: 'Discover Dining',
    href: '/dining',
    accent: 'Reservations available online',
    bg: 'from-[#1a0a0e] via-[#0B0C10] to-[#0d1a0f]',
    highlight: '#C8102E',
  },
  {
    id: 3,
    tagline: 'Exclusive Offers',
    headline: 'Honeymoon,\nFamily & More',
    sub: 'Tailored packages for every occasion — romantic escapes, family adventures, wellness retreats, and early bird deals with up to 35% savings.',
    cta: 'View All Offers',
    href: '/offers',
    accent: 'Save up to 35% — Book Direct',
    bg: 'from-[#0a1a1a] via-[#0B0C10] to-[#0d0a1a]',
    highlight: '#37EFD1',
  },
  {
    id: 4,
    tagline: 'World-Class Wellness',
    headline: '160m Infinity\nPool & Angsana Spa',
    sub: 'Malaysia\'s longest overwater infinity pool blends seamlessly with the horizon. Rejuvenate body and soul at our award-winning Angsana Spa.',
    cta: 'Explore Facilities',
    href: '/facilities',
    accent: 'Open daily from 7am',
    bg: 'from-[#0B0C10] via-[#0a1a0d] to-[#0B0C10]',
    highlight: '#37EFD1',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((next: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(next);
      setAnimating(false);
    }, 400);
  }, [animating]);

  const prev = () => go((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => go((current + 1) % SLIDES.length);

  useEffect(() => {
    const t = setInterval(() => go((current + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [current, go]);

  const slide = SLIDES[current];

  return (
    <section className="relative h-screen min-h-[680px] overflow-hidden">
      {/* Animated BG */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg} transition-all duration-1000`}>
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        {/* Radial glow */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-[120px] transition-all duration-1000"
          style={{ background: `${slide.highlight}18` }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-60 transition-all duration-1000"
          style={{ background: `${slide.id % 2 === 0 ? '#C8102E' : '#37EFD1'}12` }} />
        {/* Animated orbs */}
        <div className="absolute top-20 right-20 w-2 h-2 rounded-full bg-[#37EFD1]/60 animate-float" />
        <div className="absolute bottom-1/3 left-16 w-1.5 h-1.5 rounded-full bg-[#C8102E]/80 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-1 h-1 rounded-full bg-white/60 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Slide number / progress line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10">
        <div className="h-full bg-[#C8102E] transition-all duration-300" style={{ width: `${((current + 1) / SLIDES.length) * 100}%` }} />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className={`max-w-2xl transition-all duration-500 ${animating ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-10 transition-all duration-500" style={{ background: slide.highlight }} />
              <span className="text-[11px] font-sans tracking-[0.35em] uppercase font-medium" style={{ color: slide.highlight }}>
                {slide.tagline}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl md:text-7xl text-white leading-[1.05] mb-6 whitespace-pre-line">
              {slide.headline.split('\n')[0]}<br />
              <em className="not-italic" style={{ color: slide.highlight }}>{slide.headline.split('\n')[1]}</em>
            </h1>

            {/* Sub */}
            <p className="text-white/65 text-base md:text-lg font-sans leading-relaxed mb-8 max-w-xl">
              {slide.sub}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Link href={slide.href}
                className="inline-flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white font-sans font-medium px-7 py-3.5 rounded transition-all hover:shadow-xl hover:shadow-[#C8102E]/30 text-sm">
                {slide.cta} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/auth/register"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-[#37EFD1]/60 text-white hover:text-[#37EFD1] font-sans font-medium px-7 py-3.5 rounded transition-all text-sm">
                Book Your Stay
              </Link>
            </div>

            {/* Accent badge */}
            <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[#37EFD1] animate-pulse" />
              <span className="text-white/70 text-xs font-sans">{slide.accent}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide dots + arrows */}
      <div className="absolute bottom-10 right-6 z-20 flex flex-col items-end gap-4">
        {/* Arrows */}
        <div className="flex gap-2">
          <button onClick={prev} className="w-10 h-10 rounded-full border border-white/20 hover:border-white/50 flex items-center justify-center text-white/60 hover:text-white transition-all bg-black/20 backdrop-blur-sm">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={next} className="w-10 h-10 rounded-full border border-[#C8102E]/50 hover:border-[#C8102E] bg-[#C8102E]/10 hover:bg-[#C8102E]/20 flex items-center justify-center text-white transition-all backdrop-blur-sm">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {/* Count */}
        <div className="text-white/40 text-xs font-sans tracking-widest">
          <span className="text-white text-sm font-medium">{String(current + 1).padStart(2, '0')}</span> / {String(SLIDES.length).padStart(2, '0')}
        </div>
        {/* Dots */}
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-1.5 bg-[#C8102E]' : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'}`} />
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/30 animate-pulse" />
        <span className="text-[9px] tracking-[0.4em] uppercase font-sans">Scroll</span>
      </div>
    </section>
  );
}
