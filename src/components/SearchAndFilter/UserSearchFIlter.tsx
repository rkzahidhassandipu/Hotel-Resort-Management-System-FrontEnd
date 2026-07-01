"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X, SlidersHorizontal } from "lucide-react";

export type RoleFilter = "MANAGER" | "STAFF" | "CHEF" | "MAINTENANCE" | "";

interface StaffTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: RoleFilter;
  onRoleChange: (value: RoleFilter) => void;
  onReset: () => void;
}

const ROLE_OPTIONS: { label: string; value: RoleFilter; color: string }[] = [
  { label: "Manager",     value: "MANAGER",     color: "#a78bfa" },
  { label: "Staff",       value: "STAFF",       color: "#60a5fa" },
  { label: "Chef",        value: "CHEF",        color: "#fb923c" },
  { label: "Maintenance", value: "MAINTENANCE", color: "#37EFD1" },
];

export default function StaffTableToolbar({
  search,
  onSearchChange,
  role,
  onRoleChange,
  onReset,
}: StaffTableToolbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeRole = ROLE_OPTIONS.find((r) => r.value === role);
  const hasFilters = search !== "" || role !== "";

  return (
    <div className="flex flex-wrap items-center gap-3">

      {/* ── Search ── */}
      <div className="relative flex-1 min-w-[200px]">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or email…"
          className="
            w-full h-9 pl-8 pr-8
            bg-white/[0.04] border border-white/[0.08] rounded-lg
            text-[13px] text-white placeholder:text-white/25
            outline-none focus:border-white/20 focus:bg-white/[0.06]
            transition
          "
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* ── Role filter dropdown ── */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className={`
            flex items-center gap-2 h-9 px-3 rounded-lg border text-[13px] font-medium transition
            ${dropdownOpen
              ? "bg-white/[0.07] border-white/20 text-white"
              : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.06]"
            }
          `}
        >
          <SlidersHorizontal size={13} className="shrink-0" />

          {activeRole ? (
            <span className="flex items-center gap-1.5">
              {/* colour dot */}
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: activeRole.color }}
              />
              {activeRole.label}
            </span>
          ) : (
            <span>All Roles</span>
          )}

          <ChevronDown
            size={12}
            className={`shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div
            className="
              absolute top-full left-0 mt-1.5 w-44 z-30
              bg-[#1e1f26] border border-white/[0.08] rounded-xl shadow-xl
              overflow-hidden
              animate-in fade-in slide-in-from-top-1 duration-150
            "
          >
            {/* All roles option */}
            <button
              onClick={() => { onRoleChange(""); setDropdownOpen(false); }}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition
                ${role === ""
                  ? "bg-white/[0.06] text-white"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                }
              `}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
              All Roles
            </button>

            <div className="h-px bg-white/[0.06] mx-2" />

            {ROLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => { onRoleChange(option.value); setDropdownOpen(false); }}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition
                  ${role === option.value
                    ? "bg-white/[0.06] text-white"
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                  }
                `}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: option.color }}
                />
                {option.label}
                {role === option.value && (
                  <span className="ml-auto w-1 h-1 rounded-full bg-white/40" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Reset — only when filters active ── */}
      {hasFilters && (
        <button
          onClick={onReset}
          className="
            flex items-center gap-1.5 h-9 px-3 rounded-lg
            border border-white/[0.08] bg-white/[0.03]
            text-[13px] text-white/40 hover:text-white/70 hover:bg-white/[0.05]
            transition
          "
        >
          <X size={12} />
          Reset
        </button>
      )}
    </div>
  );
}