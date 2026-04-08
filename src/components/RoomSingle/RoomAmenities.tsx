"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface Amenity {
  name: string;
  icon?: string;
}

interface RoomAmenitiesProps {
  amenities: Amenity[];
  className?: string;
}

const CATEGORY_STYLES: { match: string; style: string }[] = [
  { match: "wifi",       style: "text-blue-500   bg-blue-500/10   border-blue-500/20"    },
  { match: "internet",   style: "text-blue-500   bg-blue-500/10   border-blue-500/20"    },
  { match: "tv",         style: "text-purple-500 bg-purple-500/10 border-purple-500/20"  },
  { match: "television", style: "text-purple-500 bg-purple-500/10 border-purple-500/20"  },
  { match: "netflix",    style: "text-purple-500 bg-purple-500/10 border-purple-500/20"  },
  { match: "minibar",    style: "text-gold-500   bg-gold-500/10   border-gold-500/20"    },
  { match: "coffee",     style: "text-gold-500   bg-gold-500/10   border-gold-500/20"    },
  { match: "breakfast",  style: "text-gold-500   bg-gold-500/10   border-gold-500/20"    },
  { match: "pool",       style: "text-cyan-500   bg-cyan-500/10   border-cyan-500/20"    },
  { match: "gym",        style: "text-cyan-500   bg-cyan-500/10   border-cyan-500/20"    },
  { match: "spa",        style: "text-cyan-500   bg-cyan-500/10   border-cyan-500/20"    },
  { match: "jacuzzi",    style: "text-cyan-500   bg-cyan-500/10   border-cyan-500/20"    },
  { match: "safe",       style: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  { match: "security",   style: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  { match: "parking",    style: "text-orange-500 bg-orange-500/10 border-orange-500/20"  },
  { match: "balcony",    style: "text-rose-500   bg-rose-500/10   border-rose-500/20"    },
  { match: "view",       style: "text-rose-500   bg-rose-500/10   border-rose-500/20"    },
  { match: "bath",       style: "text-sky-500    bg-sky-500/10    border-sky-500/20"     },
  { match: "shower",     style: "text-sky-500    bg-sky-500/10    border-sky-500/20"     },
  { match: "air",        style: "text-sky-500    bg-sky-500/10    border-sky-500/20"     },
];

function getStyle(name: string): string {
  const lower = name.toLowerCase();
  const found = CATEGORY_STYLES.find((c) => lower.includes(c.match));
  return found?.style ?? "text-muted-foreground bg-muted border-border";
}

export default function RoomAmenities({ amenities, className }: RoomAmenitiesProps) {
  if (!amenities?.length) return null;

  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-center gap-2 mb-3 bg-red-500">
        <Sparkles className="h-4 w-4 text-gold-500" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Amenities
        </h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {amenities.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {amenities.map((a) => (
          <span
            key={a.name}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium",
              getStyle(a.name)
            )}
          >
            {a.icon
              ? <span className="text-sm leading-none">{a.icon}</span>
              : <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0" />
            }
            {a.name}
          </span>
        ))}
      </div>
    </div>
  );
}