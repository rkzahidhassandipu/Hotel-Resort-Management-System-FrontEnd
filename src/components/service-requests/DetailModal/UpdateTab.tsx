"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { serviceRequestService } from "@/service/service-request.service";
import { userService } from "@/service/user.service";
import { STATUS_CFG, SRStatus } from "../shared/StatusBadge";
import { ServiceRequest, selectCls, inputCls } from "@/types/servicesTypes";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface Props {
  sr: ServiceRequest;
  onInvalidate: () => void;
}

interface StaffOption {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function UpdateTab({ sr, onInvalidate }: Props) {
  const [newStatus, setNewStatus] = useState<SRStatus>(sr.status);
  const [assignId, setAssignId] = useState(sr.assignedToId ?? "");
   const { user } = useCurrentUser();
  const isManager = user?.role === "MANAGER";
    const isStaff = user?.role === "STAFF";


  const { data: staffData } = useQuery({
    queryKey: ["staff-list"],
    queryFn: async () => {
      const r = await userService.getAll({ limit: 100 });
      return r.data?.data?.data ?? r.data?.data ?? [];
    },
  });

  const staffList: StaffOption[] = (staffData ?? []).filter(
    (s: StaffOption) => ["STAFF", "MAINTENANCE", "CHEF", "MANAGER"].includes(s.role)
  );

  const statusMut = useMutation({
    mutationFn: () => serviceRequestService.updateStatus(sr.id, newStatus),
    onSuccess: () => {
      toast.success("Status updated successfully");
      onInvalidate();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to update status");
    },
  });

  const assignMut = useMutation({
    mutationFn: () => serviceRequestService.assign(sr.id, assignId),
    onSuccess: () => {
      const staff = staffList.find(s => s.id === assignId);
      toast.success(`Assigned to ${staff?.firstName} ${staff?.lastName}`);
      onInvalidate();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to assign staff");
    },
  });

  return (
    <div className="space-y-4">
      {/* MANAGER হলে status field hide, তাই isStaff দিয়ে দেখানো হচ্ছে */}
      {isStaff && (
        <>
          <div>
            <label className="text-white/40 text-xs font-sans mb-1.5 block">Status</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value as SRStatus)} className={selectCls}>
              {(Object.keys(STATUS_CFG) as SRStatus[]).filter(s => s !== "CANCELLED").map(s => (
                <option key={s} value={s}>{STATUS_CFG[s].label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => statusMut.mutate()}
            disabled={statusMut.isPending}
            className="px-4 py-2 text-sm font-sans font-medium bg-[#37EFD1] text-[#0B0C10] rounded-lg hover:bg-[#00FFD5] disabled:opacity-60 flex items-center gap-2 transition-all"
          >
            {statusMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Update Status
          </button>
        </>
      )}

      {/* STAFF হলে assign field hide, তাই isManager দিয়ে দেখানো হচ্ছে */}
      {isManager && (
        <div className="border-t border-white/8 pt-4">
          <label className="text-white/40 text-xs font-sans mb-2 block">Assign Staff</label>
          <div className="flex gap-2">
            <select
              value={assignId}
              onChange={e => setAssignId(e.target.value)}
              className={`${selectCls} flex-1`}
            >
              <option value="">Select staff member</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.role})
                </option>
              ))}
            </select>
            <button
              onClick={() => assignMut.mutate()}
              disabled={assignMut.isPending || !assignId}
              className="px-4 py-2 text-sm font-sans font-medium bg-[#37EFD1] text-[#0B0C10] rounded-lg hover:bg-[#00FFD5] disabled:opacity-60 flex items-center gap-2 transition-all"
            >
              {assignMut.isPending ? <Loader2 size={14} className="animate-spin" /> : "Assign"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}