'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="relative py-24 bg-[#0B0C10] overflow-hidden">
      
      {/* Background highlights */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] bg-[#C8102E]/8" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8102E]/30 to-transparent" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <Sparkles className="h-8 w-8 text-[#37EFD1] mx-auto mb-6 animate-float" />

        <h2 className="font-display text-4xl md:text-5xl text-white mb-5">
          Ready for Your Dream Escape?
        </h2>

        <p className="text-white/55 font-sans mb-10 leading-relaxed text-lg">
          Book directly for the best rates, complimentary breakfast, and exclusive member benefits unavailable anywhere else.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg" className="bg-[#C8102E] hover:bg-[#a00d24] text-white shadow-lg shadow-[#C8102E]/25">
            <Link href="/auth/register">
              Book Your Stay
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="border-white/15 hover:border-[#37EFD1]/40 hover:text-[#37EFD1] text-white">
            <Link href="/facilities">
              Explore Facilities
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}