'use client';
interface FilterOption { label: string; value: string; }
interface FilterGroup { key: string; label: string; options: FilterOption[]; }
interface Props { filters: FilterGroup[]; values: Record<string, string>; onChange: (key: string, value: string) => void; onReset: () => void; }
export default function DataTableFilters({ filters, values, onChange, onReset }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {filters.map(f => (
        <select key={f.key} value={values[f.key] || ''} onChange={e => onChange(f.key, e.target.value)}
          className="bg-[#0B0C10] border border-white/8 text-white/70 text-xs font-sans px-3 py-2 rounded-lg focus:outline-none focus:border-[#37EFD1]/30 transition-colors">
          <option value="">{f.label}</option>
          {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ))}
      <button onClick={onReset} className="text-white/30 hover:text-white/60 text-xs font-sans transition-colors">Reset</button>
    </div>
  );
}
