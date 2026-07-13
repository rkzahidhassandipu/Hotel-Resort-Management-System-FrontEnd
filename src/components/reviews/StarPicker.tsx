'use client';
import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}>
          <Star className={`w-6 h-6 transition-colors ${s <= (hovered || value) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
        </button>
      ))}
    </div>
  );
}