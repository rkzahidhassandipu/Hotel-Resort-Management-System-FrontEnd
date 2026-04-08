'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TESTIMONIALS = [
  {
    name: 'Sarah Lim',
    from: 'Kuala Lumpur',
    rating: 5,
    room: 'Premier Water Chalet',
    text: 'Waking up above the sea every morning was absolutely magical. The sound of waves, the view from our private deck — I have never experienced anything quite like it. The service was impeccable and every detail felt curated just for us.',
    initials: 'SL'
  },
  {
    name: 'Ahmad Razali',
    from: 'Singapore',
    rating: 5,
    room: 'Family Water Villa',
    text: 'We brought the whole family for the school holidays and the kids absolutely loved it. The water sports, the kids club, the pools — there was never a dull moment. We will be back every year without question.',
    initials: 'AR'
  },
  {
    name: 'Jennifer Tan',
    from: 'Australia',
    rating: 5,
    room: 'Lexis Suite',
    text: 'The sunset dinner at Seahorse restaurant was genuinely extraordinary. The freshness of the seafood, the way it is positioned right over the water, the attentiveness of the staff — it was the finest dining experience of my trip to Malaysia.',
    initials: 'JT'
  },
  {
    name: 'David Chen',
    from: 'Hong Kong',
    rating: 5,
    room: 'Grand Presidential Suite',
    text: 'For our anniversary we splurged on the Presidential Suite and it exceeded every expectation. Private dock, personal chef, butler — it felt like having our own private island. Worth every ringgit and then some.',
    initials: 'DC'
  },
];

export default function TestimonialSlider() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent(c => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setCurrent(c => (c + 1) % TESTIMONIALS.length);

  useEffect(() => {
    const timer = setInterval(() => next(), 5000);
    return () => clearInterval(timer);
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

      {/* Testimonial Card */}
      <Card className="bg-[#0B0C10] border-white/10 text-center">
        <CardContent className="p-6">
          
          {/* Rating stars */}
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(t.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-[#C8102E] text-[#C8102E]" />
            ))}
          </div>

          {/* Quote */}
          <blockquote className="font-serif text-xl md:text-2xl text-white/85 italic leading-relaxed mb-6">
            "{t.text}"
          </blockquote>

          {/* User info */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C8102E] to-[#C8102E]/50 flex items-center justify-center text-white font-semibold text-sm">
              {t.initials}
            </div>
            <div className="text-left">
              <p className="text-white font-medium text-sm">{t.name}</p>
              <p className="text-white/40 text-xs">{t.from} · {t.room}</p>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <Button variant="outline" size="sm" onClick={prev} className="rounded-full text-white w-9 h-9 p-0 flex items-center justify-center">
          <ChevronLeft className="h-4 w-4 " />
        </Button>

        <div className="flex gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-6 h-1.5 bg-[#C8102E]' : 'w-1.5 h-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={next} className="rounded-full text-white w-9 h-9 p-0 flex items-center justify-center">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}