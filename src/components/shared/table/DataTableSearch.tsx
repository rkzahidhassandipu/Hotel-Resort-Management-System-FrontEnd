'use client';
import { Search, X } from 'lucide-react';
interface Props { value: string; onChange: (v: string) => void; placeholder?: string; }
export default function DataTableSearch({ value, onChange, placeholder = 'Search...' }: Props) {
  return (
    <div className="relative max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-[#0B0C10] border border-white/8 text-white/80 text-sm font-sans pl-9 pr-8 py-2 rounded-lg focus:outline-none focus:border-[#37EFD1]/30 transition-colors placeholder:text-white/20" />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
