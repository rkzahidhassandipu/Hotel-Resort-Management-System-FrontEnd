'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  { name: 'Sarah Lim', from: 'Kuala Lumpur', rating: 5, room: 'Premier Water Chalet', text: 'Waking up above the sea every morning was absolutely magical. The sound of waves, the view from our private deck — I have never experienced anything quite like it. The service was impeccable and every detail felt curated just for us.', initials: 'SL' },
  { name: 'Ahmad Razali', from: 'Singapore', rating: 5, room: 'Family Water Villa', text: 'We brought the whole family for the school holidays and the kids absolutely loved it. The water sports, the kids club, the pools — there was never a dull moment. We will be back every year without question.', initials: 'AR' },
  { name: 'Jennifer Tan', from: 'Australia', rating: 5, room: 'Lexis Suite', text: 'The sunset dinner at Seahorse restaurant was genuinely extraordinary. The freshness of the seafood, the way it is positioned right over the water, the attentiveness of the staff — it was the finest dining experience of my trip to Malaysia.', initials: 'JT' },
  { name: 'David Chen', from: 'Hong Kong', rating: 5, room: 'Grand Presidential Suite', text: 'For our anniversary we splurged on the Presidential Suite and it exceeded every expectation. Private dock, personal chef, butler — it felt like having our own private island. Worth every ringgit and then some.', initials: 'DC' },
];

export default function TestimonialSlider() {
  const [current, setCurrent] = useState(0);
  const prev = () => setCurrent(c => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setCurrent(c => (c + 1) % TESTIMONIALS.length);
  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const t = TESTIMONIALS[current];
  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Quote icon */}
      <div className="flex justify-center mb-8">
        <div className="w-12 h-12 rounded-full bg-[#C8102E]/10 border border-[#C8102E]/20 flex items-center justify-center">
          <Quote className="h-5 w-5 text-[#C8102E]" />
        </div>
      </div>

      {/* Text */}
      <div className="text-center transition-all duration-500" key={current}>
        <div className="flex justify-center gap-1 mb-6">
          {[...Array(t.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#C8102E] text-[#C8102E]" />)}
        </div>
        <blockquote className="font-serif text-xl md:text-2xl text-white/85 leading-relaxed italic mb-8 px-4">
          "{t.text}"
        </blockquote>
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C8102E] to-[#C8102E]/50 flex items-center justify-center text-white font-display font-semibold text-sm">
            {t.initials}
          </div>
          <div className="text-left">
            <p className="text-white font-sans font-medium text-sm">{t.name}</p>
            <p className="text-white/40 text-xs font-sans">{t.from} · {t.room}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-10">
        <button onClick={prev} className="w-9 h-9 rounded-full border border-white/10 hover:border-white/30 flex items-center justify-center text-white/40 hover:text-white transition-all">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-1.5 bg-[#C8102E]' : 'w-1.5 h-1.5 bg-white/20'}`} />
          ))}
        </div>
        <button onClick={next} className="w-9 h-9 rounded-full border border-white/10 hover:border-white/30 flex items-center justify-center text-white/40 hover:text-white transition-all">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
