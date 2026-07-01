"use client";
import { Loader2, UtensilsCrossed, X, ChevronDown } from "lucide-react";

// ─── Shared styles ────────────────────────────────────────────────────────────
export const inputCls =
  "w-full bg-[#0E0F14] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#37EFD1]/50 transition-colors";
export const labelCls = "block text-xs text-white/40 mb-1.5 font-sans";

// ─── InlineForm ───────────────────────────────────────────────────────────────
export function InlineForm({
  title,
  children,
  onCancel,
}: {
  title: string;
  children: React.ReactNode;
  onCancel: () => void;
}) {
  return (
    <div className="bg-[#0E0F14] border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white text-sm font-medium">{title}</h3>
        <button onClick={onCancel} className="text-white/30 hover:text-white/60 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

// ─── FormActions ──────────────────────────────────────────────────────────────
export function FormActions({
  loading,
  disabled,
  label,
  onCancel,
  onSubmit,
}: {
  loading: boolean;
  disabled: boolean;
  label: string;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <button
        onClick={onCancel}
        className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors"
      >
        Cancel
      </button>
      <button
        disabled={loading || disabled}
        onClick={onSubmit}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#37EFD1]/10 border border-[#37EFD1]/20 text-[#37EFD1] text-xs hover:bg-[#37EFD1]/20 transition-all disabled:opacity-40"
      >
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
        {label}
      </button>
    </div>
  );
}

// ─── SelectField ──────────────────────────────────────────────────────────────
export function SelectField({
  value,
  onChange,
  placeholder,
  options,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls + " appearance-none pr-8"}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-8 h-4 rounded-full transition-colors ${value ? "bg-[#37EFD1]/30" : "bg-white/10"}`}
    >
      <span
        className={`absolute top-0.5 w-3 h-3 rounded-full transition-transform ${
          value ? "translate-x-4 bg-[#37EFD1]" : "translate-x-0.5 bg-white/30"
        }`}
      />
    </button>
  );
}

// ─── ActiveBadge ──────────────────────────────────────────────────────────────
export function ActiveBadge({ active, on, off }: { active: boolean; on: string; off: string }) {
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${
        active
          ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
          : "border-white/10 text-white/30 bg-white/5"
      }`}
    >
      {active ? on : off}
    </span>
  );
}

// ─── ActionButton ─────────────────────────────────────────────────────────────
export function ActionButton({
  label,
  loading,
  color,
  onClick,
}: {
  label: string;
  loading: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{ color, borderColor: `${color}4D` }}
      className="text-[9px] px-2 py-0.5 rounded border hover:opacity-80 transition-all disabled:opacity-40"
    >
      {loading ? "..." : label}
    </button>
  );
}

// ─── IconBtn ──────────────────────────────────────────────────────────────────
export function IconBtn({
  icon,
  color,
  title,
  loading,
  onClick,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      disabled={loading}
      onClick={onClick}
      style={{ color, borderColor: `${color}33` }}
      className="p-1.5 rounded-lg border hover:opacity-80 transition-all disabled:opacity-40"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}
    </button>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-white/30" />
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-white/20 gap-2">
      <UtensilsCrossed className="h-8 w-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}