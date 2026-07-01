"use client";
import { useState } from "react";
import { Star } from "lucide-react";

interface StarPickerProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

export default function StarPicker({ label, value, onChange }: StarPickerProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex items-center justify-between">
      <span className="text-white/50 text-sm font-sans w-28">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                i <= (hovered ?? value)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-white/15"
              }`}
            />
          </button>
        ))}
        <span className="text-white/40 text-xs ml-2 w-6 text-right">
          {hovered ?? value}.0
        </span>
      </div>
    </div>
  );
}