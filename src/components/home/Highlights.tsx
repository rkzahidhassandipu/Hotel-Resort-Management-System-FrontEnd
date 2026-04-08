'use client';

import { Card, CardContent } from "@/components/ui/card";
import { BedDouble, Utensils, Waves, Award } from "lucide-react";

const HIGHLIGHTS = [
  { icon: BedDouble, label: "526 Rooms", sub: "Water chalets & villas", col: "#37EFD1" },
  { icon: Utensils, label: "6 Restaurants", sub: "World-class dining", col: "#C8102E" },
  { icon: Waves, label: "160m Pool", sub: "Longest overwater pool", col: "#4DA3FF" },
  { icon: Award, label: "Award Winning", sub: "Luxury resort", col: "#FFD166" },
];

export default function Highlights() {
  return (
    <section className="py-16 bg-[#0B0C10]">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-xl overflow-hidden">
          
          {HIGHLIGHTS.map(({ icon: Icon, label, sub, col }) => (
            
            <Card
              key={label}
              className="bg-[#0B0C10] border-0 rounded-none text-center 
              hover:bg-[#1A1B21] transition-colors"
            >
              <CardContent className="p-8 group">
                
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center transition-all group-hover:scale-110"
                  style={{
                    background: `${col}15`,
                    border: `1px solid ${col}30`,
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: col }} />
                </div>

                <p className="font-display text-xl text-white font-semibold mb-1">
                  {label}
                </p>

                <p className="text-white/40 text-xs font-sans">
                  {sub}
                </p>

              </CardContent>
            </Card>

          ))}

        </div>

      </div>
    </section>
  );
}