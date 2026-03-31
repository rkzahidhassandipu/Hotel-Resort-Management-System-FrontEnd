'use client';
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center text-center px-6">
      <div>
        <p className="text-[#C8102E] text-xs font-sans tracking-widest uppercase mb-4">Error</p>
        <h1 className="font-display text-5xl text-white mb-4">Something went wrong</h1>
        <button onClick={reset} className="inline-flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white font-sans font-medium px-7 py-3 rounded transition-all">
          Try Again
        </button>
      </div>
    </div>
  );
}
