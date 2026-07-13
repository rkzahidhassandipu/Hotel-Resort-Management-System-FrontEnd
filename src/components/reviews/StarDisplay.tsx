import { Star } from 'lucide-react';

export default function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
      ))}
      <span className="text-white/40 text-xs ml-1 font-sans">{rating.toFixed(1)}</span>
    </div>
  );
}