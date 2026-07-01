"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  X,
  Save,
  BedDouble,
  Building2,
  Users,
  Maximize2,
  Eye,
  Tag,
  Activity,
} from "lucide-react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { roomService } from "@/service/room.service";
import type { Room, RoomStatus, RoomType, BedType } from "@/types";

interface EditRoomSheetProps {
  open: boolean;
  room: Room | null;
  categories: any[];
  amenities: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS: { value: RoomStatus; label: string; color: string }[] = [
  { value: "AVAILABLE", label: "Available", color: "#37EFD1" },
  { value: "OCCUPIED", label: "Occupied", color: "#C8102E" },
  { value: "CLEANING", label: "Cleaning", color: "#F59E0B" },
  { value: "MAINTENANCE", label: "Maintenance", color: "#8B5CF6" },
  { value: "OUT_OF_ORDER", label: "Out of Order", color: "#6B7280" },
  { value: "RESERVED", label: "Reserved", color: "#3B82F6" },
];

const BED_OPTIONS: BedType[] = [
  "SINGLE",
  "DOUBLE",
  "QUEEN",
  "KING",
  "TWIN",
  "BUNK",
];
const ROOM_TYPE_OPTIONS: RoomType[] = [
  "SINGLE",
  "DOUBLE",
  "TWIN",
  "SUITE",
  "DELUXE",
  "PENTHOUSE",
  "FAMILY",
  "VILLA",
];
const VIEW_OPTIONS = [
  "Sea View",
  "Garden View",
  "Pool View",
  "City View",
  "Mountain View",
  "No View",
];

// ── tiny reusable field-wrapper ────────────────────────────────
function FieldGroup({
  icon: Icon,
  label,
  children,
}: {
  icon?: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.12em] uppercase text-white/40">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "h-9 bg-[#0D0E13] border border-white/8 text-white/80 text-sm rounded-lg " +
  "focus-visible:ring-1 focus-visible:ring-[#37EFD1]/50 focus-visible:border-[#37EFD1]/40 " +
  "placeholder:text-white/20 transition-colors hover:border-white/15";

const selectContentCls =
  "bg-[#1A1B22] border border-white/8 text-white shadow-2xl";
const selectItemCls =
  "text-white/70 hover:text-white focus:bg-white/5 focus:text-white text-sm cursor-pointer";

export default function EditRoomSheet({
  open,
  room,
  onClose,
  onSuccess,
}: EditRoomSheetProps) {
  const { data: categoriesRes, isLoading: loadingCats } = useQuery({
    queryKey: ["rooms", "categories"],
    queryFn: () => roomService.getCategories(),
    enabled: open,
  });

  const { data: amenitiesRes, isLoading: loadingAmenities } = useQuery({
    queryKey: ["rooms", "amenities"],
    queryFn: () => roomService.getAmenities(),
    enabled: open,
  });

  const categories: { id: string; name: string; basePrice: number }[] =
    categoriesRes?.data?.data ?? [];
  const amenities: { id: string; name: string }[] =
    amenitiesRes?.data?.data ?? [];

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Partial<Room>) => roomService.update(room!.id, data),
    onSuccess: () => {
      toast.success("Room updated");
      onSuccess();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Update failed"),
  });

  const form = useForm({
    defaultValues: {
      type: "" as RoomType | "",
      floor: "",
      maxOccupancy: "",
      sizeInSqFt: "",
      bedType: "" as BedType | "",
      categoryId: "",
      status: "" as RoomStatus | "",
      description: "",
      view: "",
      smokingAllowed: false,
      petFriendly: false,
      isActive: true,
      notes: "",
    },
    onSubmit: async ({ value }) => {
      mutate({
        type: value.type as RoomType,
        floor: Number(value.floor),
        maxOccupancy: Number(value.maxOccupancy),
        sizeInSqFt: value.sizeInSqFt ? Number(value.sizeInSqFt) : undefined,
        bedType: value.bedType as BedType,
        categoryId: value.categoryId || undefined,
        status: value.status as RoomStatus,
        description: value.description || undefined,
        view: value.view || undefined,
        smokingAllowed: value.smokingAllowed,
        petFriendly: value.petFriendly,
        isActive: value.isActive,
        notes: value.notes || undefined,
      });
    },
  });

  useEffect(() => {
    if (room) {
      form.reset({
        type: room.type ?? "",
        floor: String(room.floor ?? ""),
        maxOccupancy: String(room.maxOccupancy ?? ""),
        sizeInSqFt: room.sizeInSqFt ? String(room.sizeInSqFt) : "",
        bedType: room.bedType ?? "",
        categoryId: room.category?.id ?? room.categoryId ?? "",
        status: room.status ?? "",
        description: room.description ?? "",
        view: room.view ?? "",
        smokingAllowed: room.smokingAllowed ?? false,
        petFriendly: room.petFriendly ?? false,
        isActive: room.isActive ?? true,
        notes: room.notes ?? "",
      });
    }
  }, [room]);

  const currentStatus = STATUS_OPTIONS.find(
    (s) => s.value === form.getFieldValue("status"),
  );

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[460px] bg-[#13141A] border-l border-white/5 p-0 flex flex-col [&>button]:hidden"
      >
        <SheetTitle className="sr-only">Edit Room</SheetTitle>
        {/* ── Header ───────────────────────────────────────── */}
        <div className="relative px-6 pt-6 pb-5 border-b border-white/5">
          {/* accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#37EFD1]/40 to-transparent" />

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#37EFD1]/60 font-medium mb-1">
                Room Management
              </p>
              <h2 className="text-white text-lg font-semibold tracking-tight">
                {room ? (
                  <>
                    Edit{" "}
                    <span className="text-[#37EFD1] font-mono">
                      #{room.roomNumber}
                    </span>
                  </>
                ) : (
                  "Edit Room"
                )}
              </h2>
              {currentStatus && (
                <span
                  className="inline-flex items-center gap-1 mt-1.5 text-[10px] px-2 py-0.5 rounded-full border"
                  style={{
                    color: currentStatus.color,
                    borderColor: `${currentStatus.color}30`,
                    background: `${currentStatus.color}10`,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: currentStatus.color }}
                  />
                  {currentStatus.label}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────── */}
        {loadingCats || loadingAmenities ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-[#37EFD1]/40" />
              <p className="text-white/20 text-xs tracking-widest uppercase">
                Loading
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* ── Section: Identity ── */}
              <div>
                <p className="text-[9px] tracking-[0.18em] uppercase text-white/20 mb-3 font-medium">
                  Identity
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Type */}
                  <FieldGroup icon={Building2} label="Room Type">
                    <form.Field name="type">
                      {(field) => (
                        <Select
                          value={field.state.value}
                          onValueChange={(v) =>
                            field.handleChange(v as RoomType)
                          }
                        >
                          <SelectTrigger className={inputCls}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className={selectContentCls}>
                            {ROOM_TYPE_OPTIONS.map((t) => (
                              <SelectItem
                                key={t}
                                value={t}
                                className={selectItemCls}
                              >
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </form.Field>
                  </FieldGroup>

                  {/* Status */}
                  <FieldGroup icon={Activity} label="Status">
                    <form.Field name="status">
                      {(field) => (
                        <Select
                          value={field.state.value}
                          onValueChange={(v) =>
                            field.handleChange(v as RoomStatus)
                          }
                        >
                          <SelectTrigger className={inputCls}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className={selectContentCls}>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem
                                key={s.value}
                                value={s.value}
                                className={selectItemCls}
                              >
                                <span className="flex items-center gap-2">
                                  <span
                                    className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                                    style={{ background: s.color }}
                                  />
                                  {s.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </form.Field>
                  </FieldGroup>
                </div>
              </div>

              {/* ── Section: Space ── */}
              <div>
                <p className="text-[9px] tracking-[0.18em] uppercase text-white/20 mb-3 font-medium">
                  Space
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <FieldGroup icon={Building2} label="Floor">
                    <form.Field name="floor">
                      {(field) => (
                        <Input
                          type="number"
                          min={1}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={inputCls}
                        />
                      )}
                    </form.Field>
                  </FieldGroup>

                  <FieldGroup icon={Users} label="Max Guests">
                    <form.Field name="maxOccupancy">
                      {(field) => (
                        <Input
                          type="number"
                          min={1}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={inputCls}
                        />
                      )}
                    </form.Field>
                  </FieldGroup>

                  <FieldGroup icon={Maximize2} label="Size (sqft)">
                    <form.Field name="sizeInSqFt">
                      {(field) => (
                        <Input
                          type="number"
                          min={0}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={inputCls}
                        />
                      )}
                    </form.Field>
                  </FieldGroup>
                </div>
              </div>

              {/* ── Section: Features ── */}
              <div>
                <p className="text-[9px] tracking-[0.18em] uppercase text-white/20 mb-3 font-medium">
                  Features
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <FieldGroup icon={BedDouble} label="Bed Type">
                    <form.Field name="bedType">
                      {(field) => (
                        <Select
                          value={field.state.value}
                          onValueChange={(v) =>
                            field.handleChange(v as BedType)
                          }
                        >
                          <SelectTrigger className={inputCls}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className={selectContentCls}>
                            {BED_OPTIONS.map((b) => (
                              <SelectItem
                                key={b}
                                value={b}
                                className={selectItemCls}
                              >
                                {b}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </form.Field>
                  </FieldGroup>

                  <FieldGroup icon={Eye} label="View">
                    <form.Field name="view">
                      {(field) => (
                        <Select
                          value={field.state.value}
                          onValueChange={field.handleChange}
                        >
                          <SelectTrigger className={inputCls}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className={selectContentCls}>
                            {VIEW_OPTIONS.map((v) => (
                              <SelectItem
                                key={v}
                                value={v}
                                className={selectItemCls}
                              >
                                {v}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </form.Field>
                  </FieldGroup>
                </div>
              </div>

              {/* ── Category ── */}
              <FieldGroup icon={Tag} label="Category">
                <form.Field name="categoryId">
                  {(field) => (
                    <Select
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger className={inputCls}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className={selectContentCls}>
                        {categories.map((c) => (
                          <SelectItem
                            key={c.id}
                            value={c.id}
                            className={selectItemCls}
                          >
                            <span className="flex items-center justify-between w-full gap-4">
                              <span>{c.name}</span>
                              <span className="text-white/30 text-xs font-mono">
                                RM {Number(c.basePrice).toLocaleString()}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </form.Field>
              </FieldGroup>

              {/* ── Toggles ── */}
              <div>
                <p className="text-[9px] tracking-[0.18em] uppercase text-white/20 mb-3 font-medium">
                  Policies
                </p>
                <div className="rounded-xl border border-white/6 bg-white/[0.02] divide-y divide-white/5 overflow-hidden">
                  {(
                    [
                      {
                        name: "smokingAllowed",
                        label: "Smoking Allowed",
                        desc: "Guests may smoke in room",
                      },
                      {
                        name: "petFriendly",
                        label: "Pet Friendly",
                        desc: "Pets are welcome",
                      },
                      {
                        name: "isActive",
                        label: "Active",
                        desc: "Visible and bookable",
                      },
                    ] as const
                  ).map((item) => (
                    <form.Field key={item.name} name={item.name}>
                      {(field) => (
                        <div className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="text-sm text-white/70">
                              {item.label}
                            </p>
                            <p className="text-[11px] text-white/25">
                              {item.desc}
                            </p>
                          </div>
                          <Switch
                            checked={field.state.value as boolean}
                            onCheckedChange={field.handleChange}
                            className="data-[state=checked]:bg-[#37EFD1]"
                          />
                        </div>
                      )}
                    </form.Field>
                  ))}
                </div>
              </div>

              {/* ── Amenities ── */}
              {amenities.length > 0 && (
                <div>
                  <p className="text-[9px] tracking-[0.18em] uppercase text-white/20 mb-3 font-medium">
                    Amenities
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {amenities.map((a) => (
                      <span
                        key={a.id}
                        className="text-[11px] text-white/40 bg-white/4 border border-white/6 rounded-full px-2.5 py-0.5"
                      >
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Description ── */}
              <FieldGroup label="Description">
                <form.Field name="description">
                  {(field) => (
                    <textarea
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      rows={3}
                      placeholder="Room description..."
                      className="w-full bg-[#0D0E13] border border-white/8 rounded-lg px-3 py-2 text-sm text-white/70 resize-none focus:outline-none focus:ring-1 focus:ring-[#37EFD1]/40 focus:border-[#37EFD1]/30 placeholder:text-white/15 transition-colors hover:border-white/15"
                    />
                  )}
                </form.Field>
              </FieldGroup>

              {/* ── Notes ── */}
              <FieldGroup label="Internal Notes">
                <form.Field name="notes">
                  {(field) => (
                    <textarea
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      rows={2}
                      placeholder="Staff-only notes..."
                      className="w-full bg-[#0D0E13] border border-white/8 rounded-lg px-3 py-2 text-sm text-white/70 resize-none focus:outline-none focus:ring-1 focus:ring-[#37EFD1]/40 focus:border-[#37EFD1]/30 placeholder:text-white/15 transition-colors hover:border-white/15"
                    />
                  )}
                </form.Field>
              </FieldGroup>
            </div>

            {/* ── Footer ───────────────────────────────────── */}
            <div className="px-6 py-4 border-t border-white/5 flex gap-3">
              <Button
                type="button"
                onClick={onClose}
                variant="ghost"
                className="flex-1 h-9 text-white/40 hover:text-white/60 hover:bg-white/5 border border-white/6 rounded-lg text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 h-9 bg-[#37EFD1] hover:bg-[#2dd4be] text-[#0B0C10] font-semibold rounded-lg text-sm"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Save className="h-3.5 w-3.5" /> Save Changes
                  </span>
                )}
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
