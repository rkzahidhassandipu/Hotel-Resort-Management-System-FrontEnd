"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Shared Components
import DataTable, { Column } from "@/components/shared/table/DataTable";
import DataTableSearch from "@/components/shared/table/DataTableSearch";
import DataTableFilters from "@/components/shared/table/DataTableFilters";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { Button } from "@/components/ui/button";

// Services & Types
import { roomService } from "@/service/room.service";
import type { Room } from "@/types";
import { RoomActions } from "@/components/admin/Room/RoomActions";
import { RoomStats } from "@/components/admin/Room/RoomStats";
import AddRoomModal from "@/components/admin/Room/AddRoomModal";
import { ConfirmDeleteDialog } from "@/components/admin/Room/ConfirmDeleteDialog";
import { UploadImagesDialog } from "@/components/admin/Room/UploadImagesDialog";
import { AddPricingRuleDialog } from "@/components/admin/Room/AddPricingRuleDialog";
import { CategoryModal } from "@/components/admin/Room/CategoryModal";
import { AmenityModal } from "@/components/admin/Room/AmenityModal";
import EditRoomSheet from "@/components/admin/Room/EditRoomSheetProps";

const LIMIT = 10;
export const roomKeys = {
  all: (params: Record<string, unknown>) => ["rooms", "list", params] as const,
  stats: () => ["rooms", "stats"] as const,
  categories: () => ["rooms", "categories"] as const,
  amenities: () => ["rooms", "amenities"] as const,
};

interface RoomFilters {
  status: string;
  type: string;
  [key: string]: string;
}
export default function AdminRoomsPage() {
  const queryClient = useQueryClient();

  // Filter & Pagination States
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [filters, setFilters] = useState<RoomFilters>({ status: "", type: "" });

  // Modal Visibility States
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Room | null>(null); // ← new
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [imageManagerRoom, setImageManagerRoom] = useState<Room | null>(null);
  const [uploadTarget, setUploadTarget] = useState<Room | null>(null);
  const [pricingTarget, setPricingTarget] = useState<Room | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [amenityOpen, setAmenityOpen] = useState(false);

  // ── Clean Params Logic ───────────────────────────────────────
  const params: Record<string, any> = { page, limit: LIMIT };
  if (search.trim()) params.search = search;
  if (filters.status) params.status = filters.status;
  if (filters.type) params.type = filters.type;

  const currentKey = roomKeys.all(params);

  // ── Data Fetching ──────────────────────────────────────────
  const { data: roomRes, isLoading } = useQuery({
    queryKey: currentKey,
    queryFn: () => roomService.getAll(params),
    placeholderData: (p) => p,
  });

  const {
    data: statsRes,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: roomKeys.stats(),
    queryFn: () => roomService.getStats(),
  });

  const { data: categoriesRes } = useQuery({
    queryKey: roomKeys.categories(),
    queryFn: () => roomService.getCategories(),
  });

  const { data: amenitiesRes } = useQuery({
    queryKey: roomKeys.amenities(),
    queryFn: () => roomService.getAmenities(),
  });

  // ── Mutations ───────────────────────────────────────────────
  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      roomService.update(id, { status }),
    onSuccess: () => toast.success("Status updated successfully"),
    onError: () => toast.error("Failed to update status"),
    onSettled: () => {
      setPendingKey(null);
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const { mutate: deleteRoom, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => roomService.delete(id),
    onSuccess: () => {
      toast.success("Room deleted successfully");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: () => toast.error("Could not delete room"),
  });

  // ── Robust Data Extraction ──────────────────────────────────
  const rooms = (() => {
    const raw = roomRes?.data;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (raw.data && Array.isArray(raw.data.data)) return raw.data.data;
    return [];
  })();

  const total = roomRes?.data?.total || roomRes?.data?.data?.total || 0;
  const stats = statsRes?.data?.data || statsRes?.data || {};
  const byStatus: Record<string, number> = stats.byStatus ?? {};
  const totalRooms: number = stats.total ?? 0;

  // ── Table Columns ───────────────────────────────────────────
  const columns: Column<Room>[] = [
    {
      key: "roomNumber",
      header: "Room No.",
      render: (_, r) => (
        <span className="text-[#37EFD1] font-mono font-medium">
          #{r.roomNumber}
        </span>
      ),
    },
    { key: "type", header: "Type" },
    {
      key: "floor",
      header: "Floor",
      render: (_, r) => <span className="text-white/50">Lvl {r.floor}</span>,
    },
    {
      key: "category",
      header: "Price",
      render: (_, r) => (
        <span className="font-medium text-white">
          RM {Number(r.category?.basePrice || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, r) => <StatusBadgeCell status={r.status} />,
    },
    {
      key: "id",
      header: "Actions",
      render: (_, r) => (
        <RoomActions
          room={r}
          pendingKey={pendingKey}
          onEdit={setEditTarget}
          onStatusChange={(id, status) => {
            setPendingKey(id + status);
            changeStatus({ id, status });
          }}
          onManageImages={setImageManagerRoom}
          onPricingClick={setPricingTarget}
          onDeleteClick={setDeleteTarget}
          onSyncAmenities={() => toast.info("Syncing amenities data...")}
        />
      ),
    },
  ];

  const statusOptions = Array.from(new Set(rooms.map((r: Room) => r.status)))
    .filter((s): s is string => typeof s === "string")
    .map((s) => ({
      label: s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
      value: s,
    }));

  const typeOptions = Array.from(new Set(rooms.map((r: Room) => r.type)))
    .filter((t): t is string => typeof t === "string")
    .map((t) => ({
      label: t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(),
      value: t,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-5">
        <div>
          <h1 className="text-2xl font-semibold text-white">Room Management</h1>
          <p className="text-sm text-white/40">
            Overview and control of hotel inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-[#C8102E] hover:bg-[#a00d24]"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Room
          </Button>
          <Button onClick={() => setCategoryOpen(true)}>
            Manage Categories
          </Button>
          <Button onClick={() => setAmenityOpen(true)}>Manage Amenities</Button>
        </div>
      </div>

      <RoomStats total={totalRooms} byStatus={byStatus} />
      <div className="rounded-xl border border-white/5 bg-[#1A1B21] p-5">
        <div className="mb-6 flex flex-wrap gap-3">
          <DataTableSearch
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
          <DataTableFilters
            values={filters}
            onChange={(k, v) => {
              setFilters((f) => ({ ...f, [k]: v }));
              setPage(1);
            }}
            onReset={() => setFilters({ status: "", type: "" })}
            filters={[
              { key: "status", label: "Status", options: statusOptions },
              { key: "type", label: "Type", options: typeOptions },
            ]}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-white/20" />
          </div>
        ) : (
          <>
            <DataTable data={rooms} columns={columns} />
            <DataTablePagination
              page={page}
              totalPages={Math.ceil(total / LIMIT)}
              onPage={setPage}
              total={total}
              limit={LIMIT}
            />
          </>
        )}
      </div>

      {/* ── Modals ──────────────────────────────── */}
      <AddRoomModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["rooms"] })}
      />

      <EditRoomSheet
        open={!!editTarget}
        room={editTarget}
        categories={categoriesRes?.data?.data || []}
        amenities={amenitiesRes?.data?.data || []}
        onClose={() => setEditTarget(null)}
        onSuccess={() => {
          setEditTarget(null);
          queryClient.invalidateQueries({ queryKey: ["rooms"] });
        }}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        roomNumber={deleteTarget?.roomNumber ?? ""}
        onConfirm={() => deleteRoom(deleteTarget!.id)}
        onCancel={() => setDeleteTarget(null)}
        isPending={isDeleting}
      />
      {imageManagerRoom && (
        <UploadImagesDialog
          open={true}
          roomId={imageManagerRoom.id}
          onClose={() => setImageManagerRoom(null)}
        />
      )}
      {pricingTarget && (
        <AddPricingRuleDialog
          open
          roomId={pricingTarget.id}
          onClose={() => setPricingTarget(null)}
        />
      )}
      <CategoryModal
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
      />
      <AmenityModal
        open={amenityOpen}
        amenities={amenitiesRes?.data?.data || []}
        onClose={() => setAmenityOpen(false)}
      />
    </div>
  );
}
