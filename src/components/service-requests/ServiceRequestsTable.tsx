import { Eye, ClipboardList } from "lucide-react";
import DataTable, { Column } from "@/components/shared/table/DataTable";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import StatusBadge from "./shared/StatusBadge";
import PriorityBadge from "./shared/PriorityBadge";
import { ServiceRequest, fmtDate } from "@/types/servicesTypes";

interface Props {
  requests: ServiceRequest[];
  page: number;
  total: number;
  totalPages: number;
  limit: number;
  onPage: (p: number) => void;
  onView: (sr: ServiceRequest) => void;
}

export default function ServiceRequestsTable({ requests, page, total, totalPages, limit, onPage, onView }: Props) {
  const columns: Column<ServiceRequest>[] = [
    {
      key: "type", header: "Type",
      render: (_, r) => (
        <span className="text-white text-sm font-sans font-medium">
          {r.type.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "customer", header: "Guest",
      render: (_, r) => r.customer
        ? <span className="text-white/70 text-sm font-sans">{r.customer.firstName} {r.customer.lastName}</span>
        : <span className="text-white/25 text-sm">—</span>,
    },
    {
      key: "booking", header: "Room",
      render: (_, r) => (
        <span className="text-white/70 text-sm font-sans">
          {r.booking?.room?.roomNumber ?? "—"}
        </span>
      ),
    },
    {
      key: "priority", header: "Priority",
      render: (_, r) => <PriorityBadge priority={r.priority} />,
    },
    {
      key: "status", header: "Status",
      render: (_, r) => <StatusBadge status={r.status} />,
    },
    {
      key: "createdAt", header: "Created",
      render: (_, r) => <span className="text-white/40 text-xs font-sans">{fmtDate(r.createdAt)}</span>,
    },
    {
      key: "id", header: "",
      render: (_, r) => (
        <button
          onClick={() => onView(r)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-xs font-sans transition-all"
        >
          <Eye size={12} /> View
        </button>
      ),
    },
  ];

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-white/25">
        <ClipboardList size={32} className="mb-3 opacity-50" />
        <p className="text-sm font-sans">No service requests found</p>
      </div>
    );
  }

  return (
    <>
      <DataTable data={requests} columns={columns} />
      <DataTablePagination page={page} totalPages={totalPages} onPage={onPage} total={total} limit={limit} />
    </>
  );
}