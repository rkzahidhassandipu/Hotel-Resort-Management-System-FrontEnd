export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-[#C8102E]/20 animate-ping" />
          <div className="w-12 h-12 rounded-full bg-[#C8102E] flex items-center justify-center">
            <span className="text-white font-display font-bold text-xl">L</span>
          </div>
        </div>
        <p className="text-white/30 text-xs font-sans tracking-widest uppercase">Loading</p>
      </div>
    </div>
  );
}
