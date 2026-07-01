import { Star } from "lucide-react";

export function Badge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-sans ${colorClass}`}>
      {label}
    </span>
  );
}

export function RatingDots({ value }: { value?: number }) {
  if (value === undefined || value === null)
    return <span className="text-white/30 text-xs">—</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3 w-3 ${i <= Math.round(value) ? "text-yellow-400 fill-yellow-400" : "text-white/15"}`} />
      ))}
      <span className="text-white/50 text-xs ml-1">{value.toFixed(1)}</span>
    </div>
  );
}