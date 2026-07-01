"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { serviceRequestService } from "@/service/service-request.service";
import StatusBadge from "../shared/StatusBadge";
import DetailsTab from "./DetailsTab";
import UpdateTab from "./UpdateTab";
import PriorityBadge from "../shared/PriorityBadge";
import { ServiceRequest, fmtDate } from "@/types/servicesTypes";

export default function DetailModal({ sr, onClose }: { sr: ServiceRequest; onClose: () => void }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"details" | "update">("details");

  const { data: detail } = useQuery({
    queryKey: ["sr-detail", sr.id],
    queryFn: async () => {
      const res = await serviceRequestService.getById(sr.id);
      return res.data?.data as ServiceRequest;
    },
    initialData: sr,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["service-requests"] });
    qc.invalidateQueries({ queryKey: ["sr-detail", sr.id] });
    qc.invalidateQueries({ queryKey: ["sr-stats"] });
  };

  const d = detail ?? sr;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1A1B21] border border-white/8 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={d.status} />
              <PriorityBadge priority={d.priority} />
            </div>
            <h2 className="text-white font-display text-lg font-semibold">{d.type.replace(/_/g, " ")}</h2>
            <p className="text-white/30 text-xs font-sans mt-0.5">{fmtDate(d.createdAt)}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/8 mb-5">
          {(["details", "update"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-sans font-medium capitalize transition-all border-b-2 -mb-px ${
                tab === t ? "text-[#37EFD1] border-[#37EFD1]" : "text-white/40 border-transparent hover:text-white/70"
              }`}>{t}</button>
          ))}
        </div>

        {tab === "details"
          ? <DetailsTab sr={d} onInvalidate={invalidate} onClose={onClose} />
          : <UpdateTab sr={d} onInvalidate={invalidate} />
        }
      </div>
    </div>
  );
}