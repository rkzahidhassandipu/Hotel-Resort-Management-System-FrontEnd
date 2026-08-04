"use client";
import { Filter, ChevronDown } from "lucide-react";
import DataTableSearch from "@/components/shared/table/DataTableSearch";
import { ReviewStatus, selectCls, STATUS_CFG } from "./reviewTypes";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  sortBy: string;
  onSortByChange: (v: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export default function ReviewFilters({
  search, onSearchChange,
  status, onStatusChange,
  sortBy, onSortByChange,
  showFilters, onToggleFilters,
}: Props) {
  return (
    <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 flex-wrap">
        <DataTableSearch value={search} onChange={onSearchChange} placeholder="Search reviews…" />
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-sans transition-all ${
            showFilters ? "bg-[#37EFD1]/8 border-[#37EFD1]/30 text-[#37EFD1]" : "border-white/10 text-white/40 hover:text-white"
          }`}
        >
          <Filter size={13} /> Filters
          <ChevronDown size={12} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="min-w-[160px]">
            <label className="text-white/40 text-xs font-sans mb-1.5 block">Status</label>
            <select value={status} onChange={e => onStatusChange(e.target.value)} className={selectCls}>
              <option value="">All Statuses</option>
              {(["PENDING", "APPROVED", "REJECTED", "FLAGGED"] as ReviewStatus[]).map(s => (
                <option key={s} value={s}>{STATUS_CFG[s].label}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="text-white/40 text-xs font-sans mb-1.5 block">Sort By</label>
            <select value={sortBy} onChange={e => onSortByChange(e.target.value)} className={selectCls}>
              <option value="createdAt">Newest First</option>
              <option value="overallRating">Highest Rating</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}