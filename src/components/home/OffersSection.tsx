'use client';

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const OFFERS = [
  {
    title: "Honeymoon Escape",
    badge: "Romance",
    desc: "Romantic overwater stay",
    save: "SAVE 30%",
    color: "#C8102E",
  },
  {
    title: "Family Fun",
    badge: "Family",
    desc: "Kids stay free",
    save: "SAVE 25%",
    color: "#37EFD1",
  },
  {
    title: "Early Bird",
    badge: "Save",
    desc: "Book early save more",
    save: "SAVE 20%",
    color: "#4DA3FF",
  },
];

export default function OffersSection() {
  return (
    <section className="py-20 bg-[#1A1B21]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* header */}
        <div className="text-center mb-14">
          <p className="text-[#C8102E] text-[11px] font-sans tracking-[0.35em] uppercase mb-3">
            Exclusive Deals
          </p>

          <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
            Special Offers
          </h2>

          <div className="divider-crimson mx-auto" />
        </div>

        {/* cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OFFERS.map((offer) => (
            <Card
              key={offer.title}
              className="group relative border rounded-xl p-0 overflow-hidden
              bg-[#0B0C10] border-white/5
              hover:border-[#C8102E]/25
              hover:-translate-y-1
              transition-all duration-300
              hover:shadow-xl hover:shadow-[#C8102E]/5"
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${offer.color}60, transparent)`,
                }}
              />

              <CardContent className="p-6">
                
                <div className="flex items-start justify-between mb-4">
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase tracking-widest px-2.5 py-1"
                    style={{
                      color: offer.color,
                      borderColor: `${offer.color}30`,
                      background: `${offer.color}10`,
                    }}
                  >
                    {offer.badge}
                  </Badge>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#C8102E] text-white">
                    {offer.save}
                  </span>
                </div>

                <h3 className="font-display text-white text-xl mb-2">
                  {offer.title}
                </h3>

                <p className="text-white/50 text-sm leading-relaxed mb-5">
                  {offer.desc}
                </p>

                <Link
                  href="/offers"
                  className="flex items-center gap-1.5 text-sm font-medium 
                  transition-all group-hover:gap-2.5"
                  style={{ color: offer.color }}
                >
                  Learn More
                  <ChevronRight className="h-4 w-4" />
                </Link>

              </CardContent>
            </Card>
          ))}
        </div>

        {/* bottom button */}
        <div className="text-center mt-10">
          <Button
            asChild
            className="bg-[#C8102E] hover:bg-[#a00d24] text-white
            px-8 py-3 text-sm font-medium
            hover:shadow-lg hover:shadow-[#C8102E]/30"
          >
            <Link href="/offers" className="flex items-center gap-2">
              All Offers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}