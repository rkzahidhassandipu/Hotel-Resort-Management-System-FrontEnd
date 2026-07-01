"use client";
import { useState, useEffect, useCallback } from "react";
import { Users, UserCheck, UserX, Loader2, Trash2, Eye, Plus, CheckSquare, ShieldCheck } from "lucide-react";
import DataTable, { Column } from "@/components/shared/table/DataTable";
import DataTableSearch from "@/components/shared/table/DataTableSearch";
import DataTableFilters from "@/components/shared/table/DataTableFilters";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import DateCell from "@/components/shared/cell/DateCell";
import StatsCard from "@/components/shared/StatsCard";
import { userService } from "@/service/user.service";
import type { User } from "@/types";
import { parseStaffStats } from "@/lib/statsUtils";
import UserDetailDrawer from "@/components/users/UserDetailDrawer";
import CreateStaffSlideOver from "@/components/staff/CreateStaffSlideOver";
import StaffTableToolbar, { RoleFilter } from "@/components/SearchAndFilter/UserSearchFIlter";
import StaffViewSlideOver from "@/components/staff/StaffViewSlideOver";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// ── Customer Tab ────────────────────────────────────────────
function CustomersTab() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ role: "", status: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10, role: "CUSTOMER" };
      if (search) params.search = search;
      if (filters.status) params.status = filters.status;
      const res = await userService.getAll(params);
      const d = res.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
    } catch {
      setData([]);
    }
    setLoading(false);
  }, [page, search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (id: string, status: string) => {
    setActionLoading(id + status);
    try {
      await userService.updateStatus(id, status);
      await fetchData();
    } catch {}
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    setActionLoading(id + "del");
    try {
      await userService.delete(id);
      await fetchData();
    } catch {}
    setActionLoading(null);
  };

  const columns: Column<User>[] = [
    { key: "firstName", header: "User", render: (_, r) => <UserInfoCell firstName={r.firstName} lastName={r.lastName} email={r.email} /> },
    { key: "role", header: "Role", render: (_, r) => <span className="text-xs px-2 py-0.5 rounded-full bg-[#C8102E]/15 text-[#C8102E] font-sans">{r.role}</span> },
    { key: "status", header: "Status", render: (_, r) => <StatusBadgeCell status={r.status} /> },
    { key: "createdAt", header: "Joined", render: (_, r) => <DateCell date={r.createdAt} /> },
    { key: "lastLoginAt", header: "Last Login", render: (_, r) => r.lastLoginAt ? <DateCell date={r.lastLoginAt} /> : <span className="text-white/25 text-xs">Never</span> },
    {
      key: "id", header: "Actions",
      render: (_, r) => (
        <div className="flex gap-2 items-center">
          <button onClick={() => setSelectedUser(r)} className="p-1 rounded text-white/60 hover:text-[#37EFD1] hover:bg-white/5">
            <Eye className="h-4 w-4" />
          </button>
          {r.status === "ACTIVE" ? (
            <button onClick={() => handleStatusChange(r.id, "SUSPENDED")} className="text-[9px] px-2 py-0.5 rounded border border-[#fb923c]/30 text-[#fb923c] hover:bg-[#fb923c]/10">
              <UserX className="h-3 w-3 inline mr-1" />Suspend
            </button>
          ) : (
            <button onClick={() => handleStatusChange(r.id, "ACTIVE")} className="text-[9px] px-2 py-0.5 rounded border border-[#37EFD1]/30 text-[#37EFD1] hover:bg-[#37EFD1]/10">
              <UserCheck className="h-3 w-3 inline mr-1" />Activate
            </button>
          )}
          <button onClick={() => handleDelete(r.id)} className="p-1 text-[#C8102E]/60 hover:text-[#C8102E]">
            {actionLoading === r.id + "del" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <DataTableSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search customers..." />
          <DataTableFilters
            filters={[{ key: "status", label: "All Statuses", options: [{ label: "Active", value: "ACTIVE" }, { label: "Inactive", value: "INACTIVE" }, { label: "Suspended", value: "SUSPENDED" }] }]}
            values={filters}
            onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }}
            onReset={() => { setFilters({ role: "", status: "" }); setPage(1); }}
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>
        ) : (
          <>
            <DataTable data={data} columns={columns} />
            <DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} />
          </>
        )}
      </div>
      <UserDetailDrawer user={selectedUser} open={!!selectedUser} onClose={() => setSelectedUser(null)} />
    </>
  );
}

// ── Staff Tab ───────────────────────────────────────────────
function StaffTab() {
  const { user: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (role) params.role = role;
      const requests: [Promise<any>, Promise<any>?] = [userService.getStaffList(params)];
      if (isAdmin) requests.push(userService.getStats());
      const [staffRes, statsRes] = await Promise.all(requests);
      const d = staffRes.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
      if (isAdmin && statsRes) setStats(parseStaffStats(statsRes.data?.data || {}));
    } catch {
      setData([]);
    }
    setLoading(false);
  }, [page, search, role, isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleView = (user: User) => { setSelectedUser(user); setIsSlideOverOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    setDeletingId(id);
    try {
      await userService.updateStatus(id, "INACTIVE");
      fetchData();
    } catch { alert("Failed to delete staff."); }
    setDeletingId(null);
  };

  const handleVerificationToggle = async (staff: User) => {
    setTogglingId(staff.id);
    try {
      if (staff.status === "ACTIVE") await userService.updateStatus(staff.id, "INACTIVE");
      else await userService.approveStaff(staff.id);
      fetchData();
    } catch { alert("Failed to update verification."); }
    setTogglingId(null);
  };

  const columns: Column<User>[] = [
    { key: "firstName", header: "Staff Member", render: (_, r) => <UserInfoCell firstName={r.firstName} lastName={r.lastName} email={r.email} /> },
    { key: "role", header: "Role", render: (_, r) => <span className="text-xs px-2 py-0.5 rounded-full bg-[#60a5fa]/15 text-[#60a5fa]">{r.role}</span> },
    { key: "status", header: "Status", render: (_, r) => <StatusBadgeCell status={r.status} /> },
    {
      key: "id", header: "Actions",
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleView(r)} className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all">
            <Eye className="h-3.5 w-3.5" />
          </button>
          {isAdmin && (
            <button onClick={() => handleDelete(r.id)} disabled={deletingId === r.id} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40">
              {deletingId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          )}
          {isAdmin && (
            <button onClick={() => handleVerificationToggle(r)} disabled={togglingId === r.id} className={`p-1.5 rounded-lg transition-all ${r.status === "ACTIVE" ? "bg-[#37EFD1]/10 text-[#37EFD1]" : "bg-white/5 text-white/30"}`}>
              {togglingId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {isAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Staff" value={stats.total || 0} icon={Users} color="#37EFD1" />
          <StatsCard title="On Duty" value={stats.onDuty || 0} icon={CheckSquare} color="#60a5fa" />
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg transition-all text-sm">
          <Plus className="h-4 w-4" /> Add Staff
        </button>
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <StaffTableToolbar
          search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}
          role={role} onRoleChange={(v) => { setRole(v); setPage(1); }}
          onReset={() => { setSearch(""); setRole(""); setPage(1); }}
        />
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>
        ) : (
          <>
            <DataTable data={data} columns={columns} />
            <DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} />
          </>
        )}
      </div>

      <StaffViewSlideOver isOpen={isSlideOverOpen} onClose={() => setIsSlideOverOpen(false)} user={selectedUser} />
      <CreateStaffSlideOver isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={() => { fetchData(); setIsCreateOpen(false); }} />
    </>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<"customers" | "staff">("customers");
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    userService.getStats().then(res => setStats(res?.data?.data || {})).catch(() => {});
  }, []);

  const tabs = [
    { key: "customers" as const, label: "Customers" },
    { key: "staff" as const, label: "Staff" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white font-semibold">Users</h1>
        <p className="text-white/35 text-sm font-sans mt-0.5">Manage all system users</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={stats.total ?? 0} icon={Users} color="#37EFD1" />
        <StatsCard title="Active Users" value={stats.active ?? 0} icon={UserCheck} color="#60a5fa" />
        <StatsCard title="Suspended" value={stats.suspended ?? 0} icon={UserX} color="#C8102E" />
        <StatsCard title="Customers" value={stats.customers ?? 0} icon={Users} color="#fb923c" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-1.5 rounded-md text-sm font-sans transition-all ${
              activeTab === t.key ? "bg-[#C8102E] text-white" : "text-white/40 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "customers" ? <CustomersTab /> : <StaffTab />}
    </div>
  );
}