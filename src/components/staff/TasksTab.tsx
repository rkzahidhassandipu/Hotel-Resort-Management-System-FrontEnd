"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Play, CheckCheck, XCircle } from "lucide-react";
import { staffService } from "@/service/staff.service";
import { userService } from "@/service/user.service";
import DataTable, { Column } from "@/components/shared/table/DataTable";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import { fmtDate, PRIORITY_COLOR, STATUS_COLOR, StaffProfile } from "./staff.helpers";
import CompleteReviewModal from "./CompleteReviewModal";
import { Badge } from "./taff.components";
import CreateTaskModal from "./CreateTaskModal";

interface Task {
  id: string; title: string; description?: string;
  status: string; priority: string; dueDate?: string;
  assignedTo: { firstName: string; lastName: string };
  createdBy: { firstName: string; lastName: string };
  [key: string]: unknown;
}

export default function TasksTab() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [reviewTarget, setReviewTarget] = useState<{
    taskId: string; title: string; assigneeName: string;
  } | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const params: Record<string, unknown> = { page, limit: 10 };
    if (filterStatus) params.status = filterStatus;
    if (filterPriority) params.priority = filterPriority;
    const r = await staffService.getAllTasks(params);
    const d = r.data?.data;
    setTasks(d?.tasks ?? d ?? []);
    setTotal(d?.meta?.total ?? 0);
    setLoading(false);
  }, [page, filterStatus, filterPriority]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  useEffect(() => {
    userService.getStaffList({ limit: 100 })
      .then((r) => setStaffList(r.data?.data?.data ?? r.data?.data ?? []))
      .catch(() => {});
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await staffService.updateTaskStatus(id, status);
      fetchTasks();
    } catch {}
    setUpdatingId(null);
  };

  const handleCompleteWithReview = async (_rating: number, _note: string) => {
    if (!reviewTarget) return;
    setReviewSubmitting(true);
    try {
      await staffService.updateTaskStatus(reviewTarget.taskId, "COMPLETED");
      setReviewTarget(null);
      fetchTasks();
    } catch {}
    setReviewSubmitting(false);
  };

  const columns: Column<Task>[] = [
    {
      key: "title", header: "Task",
      render: (_, r) => (
        <div>
          <p className="text-white text-sm">{r.title}</p>
          {r.description && (
            <p className="text-white/40 text-xs mt-0.5 truncate max-w-[200px]">{r.description as string}</p>
          )}
        </div>
      ),
    },
    {
      key: "assignedTo", header: "Assigned To",
      render: (_, r) => (
        <span className="text-white/70 text-sm">
          {(r.assignedTo as Task["assignedTo"])?.firstName}{" "}
          {(r.assignedTo as Task["assignedTo"])?.lastName}
        </span>
      ),
    },
    {
      key: "priority", header: "Priority",
      render: (_, r) => <Badge label={r.priority as string} colorClass={PRIORITY_COLOR[r.priority as string] ?? ""} />,
    },
    {
      key: "status", header: "Status",
      render: (_, r) => <Badge label={(r.status as string).replace("_", " ")} colorClass={STATUS_COLOR[r.status as string] ?? ""} />,
    },
    {
      key: "dueDate", header: "Due",
      render: (_, r) => <span className="text-white/50 text-xs">{fmtDate(r.dueDate as string)}</span>,
    },
    {
      key: "id", header: "Actions",
      render: (_, r) => (
        <div className="flex gap-1.5">
          {r.status === "ASSIGNED" && (
            <button
              onClick={() => handleStatusUpdate(r.id as string, "IN_PROGRESS")}
              disabled={updatingId === r.id}
              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-40"
              title="Start"
            >
              {updatingId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            </button>
          )}
          {r.status === "IN_PROGRESS" && (
            <button
              onClick={() => setReviewTarget({
                taskId: r.id as string,
                title: r.title as string,
                assigneeName: `${(r.assignedTo as Task["assignedTo"])?.firstName} ${(r.assignedTo as Task["assignedTo"])?.lastName}`,
              })}
              disabled={!!updatingId}
              className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all disabled:opacity-40"
              title="Complete"
            >
              <CheckCheck className="h-3.5 w-3.5" />
            </button>
          )}
          {!["COMPLETED", "CANCELLED"].includes(r.status as string) && (
            <button
              onClick={() => handleStatusUpdate(r.id as string, "CANCELLED")}
              disabled={updatingId === r.id}
              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
              title="Cancel"
            >
              {updatingId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="bg-[#1A1B21] border border-white/8 text-white/70 text-sm px-3 py-2 rounded-lg outline-none"
          >
            <option value="">All Statuses</option>
            {["ASSIGNED","IN_PROGRESS","COMPLETED","CANCELLED","OVERDUE"].map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}
            className="bg-[#1A1B21] border border-white/8 text-white/70 text-sm px-3 py-2 rounded-lg outline-none"
          >
            <option value="">All Priorities</option>
            {["LOW","MEDIUM","HIGH","URGENT"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg text-sm transition-all"
        >
          <Plus className="h-4 w-4" /> Add Task
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/30" />
          </div>
        ) : (
          <>
            <DataTable data={tasks} columns={columns} />
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

      {/* Modals */}
      {showModal && (
        <CreateTaskModal
          staffList={staffList}
          onSuccess={fetchTasks}
          onClose={() => setShowModal(false)}
        />
      )}
      {reviewTarget && (
        <CompleteReviewModal
          task={reviewTarget}
          submitting={reviewSubmitting}
          onConfirm={handleCompleteWithReview}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
}