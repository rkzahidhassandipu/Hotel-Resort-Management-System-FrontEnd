'use client';
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: string; header: string; sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}
interface Props<T> {
  data: T[]; columns: Column<T>[]; loading?: boolean; emptyMessage?: string;
  onSort?: (key: string) => void; sortBy?: string; sortDir?: 'asc' | 'desc';
}
export default function DataTable<T extends Record<string, unknown>>({ data, columns, loading, emptyMessage = 'No data found', onSort, sortBy, sortDir }: Props<T>) {

  return (
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5 bg-[#0B0C10]">
            {columns.map((col, colIndex) => {
              const headerKey = `${col.key}-${colIndex}`;
              return (
                <th key={headerKey} className={`text-left px-4 py-3 text-[10px] font-sans uppercase tracking-widest text-white/30 font-normal ${col.className || ''}`}>
                  {col.sortable ? (
                    <button className="flex items-center gap-1 hover:text-white/60 transition-colors" onClick={() => onSort?.(col.key)}>
                      {col.header}
                      <span className="flex flex-col">
                        <ChevronUp className={`h-2 w-2 ${sortBy === col.key && sortDir === 'asc' ? 'text-[#37EFD1]' : ''}`} />
                        <ChevronDown className={`h-2 w-2 -mt-1 ${sortBy === col.key && sortDir === 'desc' ? 'text-[#37EFD1]' : ''}`} />
                      </span>
                    </button>
                  ) : col.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-white/3">
                {columns.map((col, colIndex) => (
                  <td key={`${col.key}-${rowIndex}-${colIndex}`} className="px-4 py-3"><div className="h-4 rounded skeleton w-24" /></td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-white/25 text-sm font-sans">{emptyMessage}</td></tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-white/3 last:border-0 hover:bg-white/2 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={`${col.key}-${rowIndex}-${colIndex}`} className={`px-4 py-3 text-sm font-sans text-white/70 ${col.className || ''}`}>
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
