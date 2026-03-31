'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
interface Props { page: number; totalPages: number; onPage: (p: number) => void; total: number; limit: number; }
export default function DataTablePagination({ page, totalPages, onPage, total, limit }: Props) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return (
    <div className="flex items-center justify-between pt-4 border-t border-white/5">
      <p className="text-white/30 text-xs font-sans">Showing {start}–{end} of {total}</p>
      <div className="flex items-center gap-2">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1}
          className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-30 transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
          return p <= totalPages ? (
            <button key={p} onClick={() => onPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-sans transition-all ${p === page ? 'bg-[#C8102E] text-white' : 'text-white/40 hover:text-white border border-white/8'}`}>
              {p}
            </button>
          ) : null;
        })}
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages}
          className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-30 transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
