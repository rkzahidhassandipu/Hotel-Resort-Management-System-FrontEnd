"use client";
import { Filter, X, ChevronDown } from "lucide-react";
import { STATUS_CFG, SRStatus } from "./shared/StatusBadge";
import { useState } from "react";
import { SR_TYPES, selectCls, ServiceRequestFilters } from "@/types/servicesTypes";

interface Props {
  filters: ServiceRequestFilters;
  onChange: (filters: ServiceRequestFilters) => void;
}

export default function ServiceRequestsFilters({ filters, onChange }: Props) {
  const hasFilters = !!(filters.status || filters.type || filters.priority);
  const [open, setOpen] = useState(false);

  const update = (key: string, value: string) =>
    onChange({ ...filters, [key]: value, page: "1" });

  const clear = () =>
    onChange({ status: "", type: "", priority: "", page: "1", limit: "10" });

  return (
    <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(v => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-sans transition-all ${
            open ? "bg-[#37EFD1]/8 border-[#37EFD1]/30 text-[#37EFD1]" : "border-white/10 text-white/40 hover:text-white"
          }`}
        >
          <Filter size={13} /> Filters
          <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {hasFilters && (
          <button
            onClick={clear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/20 text-red-400 text-sm font-sans hover:bg-red-500/10 transition-all"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {open && (
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            { key: "status",   label: "Status",   opts: ["", ...Object.keys(STATUS_CFG)] },
            { key: "type",     label: "Type",     opts: ["", ...SR_TYPES] },
            { key: "priority", label: "Priority", opts: ["", "LOW", "MEDIUM", "HIGH", "URGENT"] },
          ].map(({ key, label, opts }) => (
            <div key={key} className="min-w-[160px]">
              <label className="text-white/40 text-xs font-sans mb-1.5 block">{label}</label>
              <select
                value={filters[key]}
                onChange={e => update(key, e.target.value)}
                className={selectCls}
              >
                {opts.map(o => (
                  <option key={o} value={o}>{o ? o.replace(/_/g, " ") : `All ${label}s`}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}