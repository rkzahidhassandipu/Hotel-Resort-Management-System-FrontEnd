"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw, Loader2 } from "lucide-react";
import { serviceRequestService } from "@/service/service-request.service";
import ServiceRequestsStats from "@/components/service-requests/ServiceRequestsStats";
import ServiceRequestsFilters from "@/components/service-requests/ServiceRequestsFilters";
import ServiceRequestsTable from "@/components/service-requests/ServiceRequestsTable";
import CreateRequestModal from "@/components/service-requests/CreateRequestModal";
import DetailModal from "@/components/service-requests/DetailModal";
import { ServiceRequest, SRStatus } from "@/types/servicesTypes";

interface Filters {
  status: string; type: string; priority: string; page: string; limit: string;
}

export default function ServiceRequestsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const [filters, setFilters] = useState<Filters>({ status: "", type: "", priority: "", page: "1", limit: "10" });

  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => Boolean(v)));

  const { data: listData, isLoading, refetch } = useQuery({
    queryKey: ["service-requests", params],
    queryFn: async () => {
      const res = await serviceRequestService.getAll(params);
      return res.data?.data as {
        requests: ServiceRequest[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      };
    },
  });


  const { data: statsData } = useQuery({
    queryKey: ["sr-stats"],
    queryFn: async () => {
      const res = await serviceRequestService.getStats();
      return res.data?.data as {
        byStatus: { status: SRStatus; _count: { status: number } }[];
        pendingCount: number;
      };
    },
  });

  const meta = listData?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-6">
        <div>
          <h1 className="font-display text-2xl text-white font-semibold">Service Requests</h1>
          <p className="text-white/35 text-sm font-sans mt-0.5">Manage guest service requests</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <RefreshCw size={15} />
          </button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg text-sm font-sans transition-all">
            <Plus size={15} /> New Request
          </button>
        </div>
      </div>

      {/* Stats */}
      <ServiceRequestsStats
        pendingCount={statsData?.pendingCount ?? 0}
        inProgressCount={statsData?.byStatus.find(s => s.status === "IN_PROGRESS")?._count.status ?? 0}
        completedCount={statsData?.byStatus.find(s => s.status === "COMPLETED")?._count.status ?? 0}
        requests={listData}
      />

      {/* Filters */}
      <ServiceRequestsFilters filters={filters} onChange={setFilters} />

      {/* Table */}
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/30" />
          </div>
        ) : (
          <ServiceRequestsTable
            requests={listData}
            page={Number(filters.page)}
            total={meta?.total ?? 0}
            totalPages={meta?.totalPages ?? 1}
            limit={Number(filters.limit)}
            onPage={p => setFilters(prev => ({ ...prev, page: String(p) }))}
            onView={setSelected}
          />
        )}
      </div>

      {showCreate && <CreateRequestModal onClose={() => setShowCreate(false)} />}
      {selected && <DetailModal sr={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}