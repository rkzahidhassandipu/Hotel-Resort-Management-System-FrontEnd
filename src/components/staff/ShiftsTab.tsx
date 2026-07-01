"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus } from "lucide-react";
import { staffService } from "@/service/staff.service";
import { userService } from "@/service/user.service";
import DataTable, { Column } from "@/components/shared/table/DataTable";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import {
  fmtDate,
  fmtTime,
  SHIFT_TYPE_COLOR,
  StaffProfile,
} from "./staff.helpers";
import { Badge } from "./taff.components";
import CreateShiftModal from "./CreateShiftModal";

interface Shift {
  id: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  isPresent: boolean;
  notes?: string;
  staffProfile: { user: { firstName: string; lastName: string } };
  [key: string]: unknown;
}

export default function ShiftsTab() {
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "MORNING",
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    userService
      .getStaffList({ limit: 100 })
      .then((r) => setStaffList(r.data?.data?.data ?? r.data?.data ?? []))
      .catch(() => {});
  }, []);

  const fetchShifts = useCallback(async () => {
    if (!selectedProfile) return;
    setLoading(true);
    const profile = staffList.find((s) => s.id === selectedProfile);
    const profileId = profile?.staffProfile?.id;
    if (!profileId) {
      setLoading(false);
      return;
    }
    const r = await staffService.getShifts(profileId);
    const d = r.data?.data;
    setShifts(d?.shifts ?? d ?? []);
    setTotal(d?.meta?.total ?? 0);
    setLoading(false);
  }, [selectedProfile, staffList, page]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const handleCreate = async () => {
    setError("");
    const profile = staffList.find((s) => s.id === selectedProfile);
    const profileId = profile?.staffProfile?.id;
    if (!profileId) {
      setError("Select a staff member first");
      return;
    }
    if (!form.date || !form.startTime || !form.endTime) {
      setError("Date and times are required");
      return;
    }
    setCreating(true);
    try {
      await staffService.createShift({
        staffProfileId: profileId,
        type: form.type,
        date: new Date(form.date + "T00:00:00").toISOString(),
        startTime: new Date(`${form.date}T${form.startTime}:00`).toISOString(),
        endTime: new Date(`${form.date}T${form.endTime}:00`).toISOString(),
        ...(form.notes && { notes: form.notes }),
      });
      setShowForm(false);
      setForm({
        type: "MORNING",
        date: "",
        startTime: "",
        endTime: "",
        notes: "",
      });
      fetchShifts();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to create shift");
    }
    setCreating(false);
  };

  const columns: Column<Shift>[] = [
    {
      key: "staffProfile",
      header: "Staff",
      render: (_, r) => (
        <span className="text-white text-sm">
          {r.staffProfile?.user?.firstName} {r.staffProfile?.user?.lastName}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (_, r) => (
        <Badge label={r.type} colorClass={SHIFT_TYPE_COLOR[r.type] ?? ""} />
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (_, r) => (
        <span className="text-white/70 text-sm">{fmtDate(r.date)}</span>
      ),
    },
    {
      key: "startTime",
      header: "Time",
      render: (_, r) => (
        <span className="text-white/70 text-sm">
          {fmtTime(r.startTime)} – {fmtTime(r.endTime)}
        </span>
      ),
    },
    {
      key: "isPresent",
      header: "Attendance",
      render: (_, r) => (
        <Badge
          label={r.isPresent ? "Present" : "Absent"}
          colorClass={
            r.isPresent
              ? "bg-green-500/15 text-green-400"
              : "bg-red-500/15 text-red-400"
          }
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select
          value={selectedProfile}
          onChange={(e) => {
            setSelectedProfile(e.target.value);
            setPage(1);
          }}
          className="bg-[#1A1B21] border border-white/8 text-white text-sm font-sans px-3 py-2 rounded-lg outline-none"
        >
          <option value="">Select staff member</option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.firstName} {s.lastName} ({s.role})
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg text-sm transition-all"
        >
          <Plus className="h-4 w-4" /> Add Shift
        </button>
      </div>

      {showForm && (
        <CreateShiftModal
          onClose={() => setShowForm(false)}
          onCreate={handleCreate}
        />
      )}

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/30" />
          </div>
        ) : shifts.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">
            {selectedProfile
              ? "No shifts found"
              : "Select a staff member to view shifts"}
          </p>
        ) : (
          <>
            <DataTable data={shifts} columns={columns} />
            <DataTablePagination
              page={page}
              totalPages={Math.ceil(total / 10)}
              onPage={setPage}
              total={total}
              limit={10}
            />
          </>
        )}
      </div>
    </div>
  );
}
