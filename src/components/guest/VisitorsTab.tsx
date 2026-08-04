// ── components/guest/VisitorsTab.tsx ─────────────────────
"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, UserPlus, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import DataTable, { Column } from "@/components/shared/table/DataTable";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import { guestService } from "@/service/guest.service";
import { Modal, Field, inputCls, selectCls, fmtDate } from "./shared";
import { Visitor } from "@/types/guests.types";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function VisitorsTab() {
  const { user } = useCurrentUser();
  const isAdmin = user?.role === "ADMIN";
  const isStaff = user?.role === "STAFF";
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [converted, setConverted] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Visitor | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    purpose: "",
    notes: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["visitors", page, search, converted],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (converted) params.convertedToCustomer = converted;
      const res = await guestService.getVisitors(params);
      const d = res.data?.data;
      return {
        visitors: Array.isArray(d) ? d : (d?.visitors ?? []),
        meta: res.data?.meta ?? d?.meta,
      } as { visitors: Visitor[]; meta: any };
    },
  });

  const createMut = useMutation({
    mutationFn: () =>
      guestService.registerVisitor({
        ...form,
        phone: form.phone.trim() || undefined,
        purpose: form.purpose.trim() || undefined,
        notes: form.notes.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Visitor registered");
      qc.invalidateQueries({ queryKey: ["visitors"] });
      qc.invalidateQueries({ queryKey: ["guest-stats"] });
      setShowCreate(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        purpose: "",
        notes: "",
      });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
  });

  const convertMut = useMutation({
    mutationFn: (id: string) => guestService.convertToCustomer(id),
    onSuccess: (res) => {
      toast.success(res.data?.data?.message ?? "Converted");
      qc.invalidateQueries({ queryKey: ["visitors"] });
      qc.invalidateQueries({ queryKey: ["guest-stats"] });
      setSelected(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
  });

  const visitors = data?.visitors ?? [];
  const meta = data?.meta;

  const columns: Column<Visitor>[] = [
    {
      key: "firstName",
      header: "Name",
      render: (_, r) => (
        <div>
          <p className="text-white text-sm font-sans">
            {r.firstName} {r.lastName}
          </p>
          <p className="text-white/40 text-xs font-sans">{r.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (_, r) => (
        <span className="text-white/60 text-sm font-sans">
          {r.phone ?? "—"}
        </span>
      ),
    },
    {
      key: "purpose",
      header: "Purpose",
      render: (_, r) => (
        <span className="text-white/60 text-sm font-sans truncate max-w-[120px] block">
          {r.purpose ?? "—"}
        </span>
      ),
    },
    {
      key: "visitedAt",
      header: "Visited",
      render: (_, r) => (
        <span className="text-white/40 text-xs font-sans">
          {fmtDate(r.visitedAt)}
        </span>
      ),
    },
    {
      key: "convertedToCustomer",
      header: "Status",
      render: (_, r) =>
        r.convertedToCustomer ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 font-sans">
            Converted
          </span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-sans">
            Visitor
          </span>
        ),
    },
    {
      key: "id",
      header: "",
      render: (_, r) => (
        <div className="flex gap-1.5">
          <button
            onClick={() => setSelected(r)}
            className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white transition-all"
          >
            <Eye size={13} />
          </button>
          {/* ✅ STAFF হলে Convert button hide */}
          {!r.convertedToCustomer && !isStaff && (
            <button
              onClick={() => convertMut.mutate(r.id)}
              disabled={convertMut.isPending}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#37EFD1]/10 text-[#37EFD1] hover:bg-[#37EFD1]/20 text-xs font-sans transition-all disabled:opacity-60"
            >
              {convertMut.isPending ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <UserPlus size={11} />
              )}
              Convert
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search visitors…"
              className={`${inputCls} pl-9 w-48`}
            />
          </div>
          <select
            value={converted}
            onChange={(e) => {
              setConverted(e.target.value);
              setPage(1);
            }}
            className={`${selectCls} w-40`}
          >
            <option value="">All Visitors</option>
            <option value="true">Converted</option>
            <option value="false">Not Converted</option>
          </select>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg text-sm font-sans transition-all"
          >
            <Plus size={14} /> Register Visitor
          </button>
        )}
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/30" />
          </div>
        ) : (
          <>
            <DataTable data={visitors as any} columns={columns as any} />
            <DataTablePagination
              page={page}
              totalPages={meta?.totalPages ?? 1}
              onPage={setPage}
              total={meta?.total ?? 0}
              limit={10}
            />
          </>
        )}
      </div>

      {showCreate && (
        <Modal title="Register Visitor" onClose={() => setShowCreate(false)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name *">
                <input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, firstName: e.target.value }))
                  }
                  className={inputCls}
                  placeholder="John"
                />
              </Field>
              <Field label="Last Name *">
                <input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lastName: e.target.value }))
                  }
                  className={inputCls}
                  placeholder="Doe"
                />
              </Field>
            </div>
            <Field label="Email *">
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                className={inputCls}
                placeholder="john@example.com"
              />
            </Field>
            <Field label="Phone">
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                className={inputCls}
                placeholder="+60 12 345 6789"
              />
            </Field>
            <Field label="Purpose">
              <input
                value={form.purpose}
                onChange={(e) =>
                  setForm((p) => ({ ...p, purpose: e.target.value }))
                }
                className={inputCls}
                placeholder="Visit purpose"
              />
            </Field>
            <Field label="Notes">
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                className={`${inputCls} resize-none`}
                placeholder="Optional notes"
              />
            </Field>
          </div>
          <div className="flex gap-2 mt-5 justify-end">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm font-sans text-white/50 hover:text-white border border-white/10 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => createMut.mutate()}
              disabled={createMut.isPending}
              className="px-4 py-2 text-sm font-sans font-medium bg-[#C8102E] text-white rounded-lg hover:bg-[#a00d24] disabled:opacity-60 flex items-center gap-2 transition-all"
            >
              {createMut.isPending && (
                <Loader2 size={14} className="animate-spin" />
              )}
              Register
            </button>
          </div>
        </Modal>
      )}

      {selected && (
        <Modal title="Visitor Details" onClose={() => setSelected(null)}>
          <div className="space-y-3">
            {[
              {
                label: "Name",
                value: `${selected.firstName} ${selected.lastName}`,
              },
              { label: "Email", value: selected.email },
              { label: "Phone", value: selected.phone ?? "—" },
              { label: "Purpose", value: selected.purpose ?? "—" },
              { label: "Notes", value: selected.notes ?? "—" },
              { label: "Visited", value: fmtDate(selected.visitedAt) },
              {
                label: "Status",
                value: selected.convertedToCustomer
                  ? "Converted to Customer"
                  : "Visitor",
              },
            ].map((r) => (
              <div key={r.label} className="flex gap-3">
                <span className="text-white/30 text-xs font-sans min-w-[80px] pt-0.5">
                  {r.label}
                </span>
                <span className="text-white/80 text-sm font-sans">
                  {r.value}
                </span>
              </div>
            ))}
            {!selected.convertedToCustomer && !isStaff && (
              <button
                onClick={() => convertMut.mutate(selected.id)}
                disabled={convertMut.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#37EFD1]/10 text-[#37EFD1] hover:bg-[#37EFD1]/20 text-sm font-sans transition-all mt-3 disabled:opacity-60"
              >
                {convertMut.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UserPlus size={14} />
                )}
                Convert to Customer
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
