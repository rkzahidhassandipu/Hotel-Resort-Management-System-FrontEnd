import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center text-center px-6">
      <div>
        <p className="text-[#C8102E] text-xs font-sans tracking-[0.3em] uppercase mb-4">404 — Not Found</p>
        <h1 className="font-display text-5xl text-white mb-4">Page Not Found</h1>
        <p className="text-white/40 font-sans mb-8 max-w-md mx-auto">The page you are looking for does not exist or has been moved.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white font-sans font-medium px-7 py-3 rounded transition-all">
          Return Home
        </Link>
      </div>
    </div>
  );
}
