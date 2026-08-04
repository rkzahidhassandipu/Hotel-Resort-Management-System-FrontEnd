import { Star } from "lucide-react";

export default function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`h-3 w-3 ${s <= rating ? "text-orange-400 fill-orange-400" : "text-white/10"}`} />
      ))}
      <span className="text-white/50 text-xs ml-1 font-sans">{rating.toFixed(1)}</span>
    </div>
  );
}