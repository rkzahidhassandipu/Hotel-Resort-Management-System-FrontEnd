'use client';

import TestimonialSlider from "../modules/Public/TestimonialSlider";

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-[#1A1B21]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* header */}
        <div className="text-center mb-14">
          <p className="text-[#C8102E] text-[11px] font-sans tracking-[0.35em] uppercase mb-3">
            Guest Stories
          </p>

          <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
            What Our Guests Say
          </h2>

          <div className="divider-crimson mx-auto" />
        </div>

        {/* slider */}
        <TestimonialSlider />

      </div>
    </section>
  );
}