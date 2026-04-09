"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  BedDouble, Users, Building2, Eye, Maximize2,
  Check, AlertCircle, Loader2, X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Textarea }  from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch }    from "@/components/ui/switch";
import { Badge }     from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn }        from "@/lib/utils";
import { roomService } from "@/service/room.service";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RoomCategory {
  id: string;
  name: string;
  basePrice: number | string;
  maxOccupancy: number;
}

interface Amenity {
  id: string;
  name: string;
  icon?: string;
  category?: string;
}

// AddRoomModal.tsx এ
interface AddRoomModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // ✅ optional
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ROOM_TYPES = ["STANDARD", "DELUXE", "SUITE", "VILLA", "PENTHOUSE"] as const;
const BED_TYPES  = ["SINGLE", "DOUBLE", "QUEEN", "KING", "TWIN"]         as const;
const VIEWS = [
  "Garden View", "Pool View", "Ocean View",
  "City View", "Mountain View", "Courtyard View",
];

const INITIAL_FORM = {
  roomNumber:     "",
  floor:          "",
  type:           "",
  bedType:        "",
  maxOccupancy:   "",
  sizeInSqFt:     "",
  categoryId:     "",
  description:    "",
  view:           "",
  smokingAllowed: false,
  petFriendly:    false,
  notes:          "",
  amenityIds:     [] as string[],
};

// ─── Small UI helpers ─────────────────────────────────────────────────────────
function SectionHeading({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <Icon className="h-3.5 w-3.5 text-[#37EFD1]" />
      <span className="text-[11px] font-semibold text-[#37EFD1] uppercase tracking-widest">
        {title}
      </span>
      <Separator className="flex-1 bg-white/5" />
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-[11px] text-white/40 uppercase tracking-widest font-medium">
      {children}
    </Label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-[11px] text-red-400 mt-1">
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      {msg}
    </p>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddRoomModal({ open, onClose, onSuccess }: AddRoomModalProps) {
  const [form,   setForm]   = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast,  setToast]  = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ── Reference data via React Query ─────────────────────────────────────────
  const { data: catRes } = useQuery({
    queryKey: ["rooms", "categories"],
    queryFn:  () => roomService.getCategories(),
    enabled:  open,
    staleTime: 5 * 60 * 1000,
  });

  const { data: amenRes } = useQuery({
    queryKey: ["rooms", "amenities"],
    queryFn:  () => roomService.getAmenities(),
    enabled:  open,
    staleTime: 5 * 60 * 1000,
  });

  const categories: RoomCategory[] = Array.isArray(catRes?.data) ? catRes.data : [];
  const amenities:  Amenity[]      = Array.isArray(amenRes?.data) ? amenRes.data : [];

  // ── Reset on open ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) { setForm(INITIAL_FORM); setErrors({}); setToast(null); }
  }, [open]);

  // ── Auto-dismiss toast ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Create mutation ────────────────────────────────────────────────────────
  const { mutate: createRoom, isPending } = useMutation({
    mutationFn: (payload: Record<string, unknown>) => roomService.create(payload),
   onSuccess: () => {
  setToast({ type: "success", msg: `Room #${form.roomNumber} created successfully` });
  setTimeout(() => {
    onSuccess?.();
    onClose();
  }, 1200);
},
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || "Failed to create room";
      setToast({ type: "error", msg });
    },
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  function set<K extends keyof typeof INITIAL_FORM>(key: K, val: (typeof INITIAL_FORM)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function toggleAmenity(id: string) {
    setForm((f) => ({
      ...f,
      amenityIds: f.amenityIds.includes(id)
        ? f.amenityIds.filter((a) => a !== id)
        : [...f.amenityIds, id],
    }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.roomNumber.trim()) e.roomNumber   = "Room number is required";
    if (!form.floor)             e.floor        = "Floor is required";
    if (!form.type)              e.type         = "Room type is required";
    if (!form.bedType)           e.bedType      = "Bed type is required";
    if (!form.maxOccupancy)      e.maxOccupancy = "Max occupancy is required";
    if (!form.categoryId)        e.categoryId   = "Category is required";
    if (form.floor        && isNaN(Number(form.floor)))        e.floor        = "Must be a number";
    if (form.maxOccupancy && isNaN(Number(form.maxOccupancy))) e.maxOccupancy = "Must be a number";
    if (form.sizeInSqFt   && isNaN(Number(form.sizeInSqFt)))  e.sizeInSqFt   = "Must be a number";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    createRoom({
      roomNumber:   form.roomNumber.trim(),
      floor:        Number(form.floor),
      type:         form.type,
      bedType:      form.bedType,
      maxOccupancy: Number(form.maxOccupancy),
      ...(form.sizeInSqFt  && { sizeInSqFt:  Number(form.sizeInSqFt) }),
      categoryId:   form.categoryId,
      ...(form.description && { description: form.description.trim() }),
      ...(form.view        && { view:        form.view }),
      smokingAllowed: form.smokingAllowed,
      petFriendly:    form.petFriendly,
      ...(form.notes       && { notes:       form.notes.trim() }),
      ...(form.amenityIds.length && { amenityIds: form.amenityIds }),
    });
  }

  // Group amenities by category
  const amenityGroups = amenities.reduce<Record<string, Amenity[]>>((acc, a) => {
    const cat = a.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  const field =
    "bg-[#0E0F14] border-white/8 text-white placeholder:text-white/20 " +
    "focus-visible:ring-[#37EFD1]/20 focus-visible:border-[#37EFD1]/40";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      {/*
        SheetContent side="right" — slides in from the right.
        Override Shadcn's default width (w-3/4 or sm:max-w-sm) with our own.
        [&>button]:hidden removes the default close × from SheetContent.
      */}
      <SheetContent
        side="right"
        className={cn(
          "w-full max-w-xl p-0 flex flex-col gap-0",
          "bg-[#13141A] border-l border-white/6 text-white",
          "[&>button]:hidden",           // hide Shadcn's built-in close button
        )}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <SheetHeader className="flex-row items-center justify-between px-6 py-5 border-b border-white/6 flex-shrink-0 space-y-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#37EFD1]/10 flex items-center justify-center">
              <BedDouble className="h-4 w-4 text-[#37EFD1]" />
            </div>
            <div>
              <SheetTitle className="font-display text-base text-white font-semibold leading-none">
                Add New Room
              </SheetTitle>
              <SheetDescription className="text-white/30 text-[11px] font-sans mt-0.5">
                Fill in the room details below
              </SheetDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-white/30 hover:text-white hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        {/* ── Toast ───────────────────────────────────────────────── */}
        {toast && (
          <div
            className={cn(
              "mx-6 mt-4 flex-shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm border",
              toast.type === "success"
                ? "bg-[#37EFD1]/8 border-[#37EFD1]/20 text-[#37EFD1]"
                : "bg-red-500/8 border-red-500/20 text-red-400"
            )}
          >
            {toast.type === "success"
              ? <Check className="h-4 w-4 flex-shrink-0" />
              : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
            {toast.msg}
          </div>
        )}

        {/* ── Scrollable form ──────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* Room Identity */}
          <SectionHeading title="Room Identity" icon={BedDouble} />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FieldLabel>Room Number *</FieldLabel>
              <Input className={field} placeholder="e.g. 301"
                value={form.roomNumber} onChange={(e) => set("roomNumber", e.target.value)} />
              <FieldError msg={errors.roomNumber} />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Floor *</FieldLabel>
              <Input className={field} placeholder="e.g. 3" type="number" min={0}
                value={form.floor} onChange={(e) => set("floor", e.target.value)} />
              <FieldError msg={errors.floor} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FieldLabel>Room Type *</FieldLabel>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger className={cn(field, "w-full")}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1B21] border-white/8 text-white">
                  {ROOM_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="focus:bg-white/5 focus:text-white">
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError msg={errors.type} />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Bed Type *</FieldLabel>
              <Select value={form.bedType} onValueChange={(v) => set("bedType", v)}>
                <SelectTrigger className={cn(field, "w-full")}>
                  <SelectValue placeholder="Select bed" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1B21] border-white/8 text-white">
                  {BED_TYPES.map((b) => (
                    <SelectItem key={b} value={b} className="focus:bg-white/5 focus:text-white">
                      {b.charAt(0) + b.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError msg={errors.bedType} />
            </div>
          </div>

          {/* Capacity & Size */}
          <SectionHeading title="Capacity & Size" icon={Users} />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FieldLabel>Max Occupancy *</FieldLabel>
              <Input className={field} placeholder="e.g. 2" type="number" min={1}
                value={form.maxOccupancy} onChange={(e) => set("maxOccupancy", e.target.value)} />
              <FieldError msg={errors.maxOccupancy} />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Size (sq ft)</FieldLabel>
              <Input className={field} placeholder="e.g. 450" type="number" min={1}
                value={form.sizeInSqFt} onChange={(e) => set("sizeInSqFt", e.target.value)} />
              <FieldError msg={errors.sizeInSqFt} />
            </div>
          </div>

          {/* Category & Pricing */}
          <SectionHeading title="Category & Pricing" icon={Building2} />

          <div className="space-y-3">
            <div className="space-y-1.5">
              <FieldLabel>Room Category *</FieldLabel>
              <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
                <SelectTrigger className={cn(field, "w-full")}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1B21] border-white/8 text-white">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="focus:bg-white/5 focus:text-white">
                      {c.name} — RM {Number(c.basePrice).toLocaleString()}/night
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError msg={errors.categoryId} />
            </div>

            <div className="space-y-1.5">
              <FieldLabel>View</FieldLabel>
              <Select value={form.view} onValueChange={(v) => set("view", v)}>
                <SelectTrigger className={cn(field, "w-full")}>
                  <SelectValue placeholder="No specific view" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1B21] border-white/8 text-white">
                  {VIEWS.map((v) => (
                    <SelectItem key={v} value={v} className="focus:bg-white/5 focus:text-white">
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preferences */}
          <SectionHeading title="Preferences" icon={Eye} />

          <div className="flex gap-6">
            <div className="flex items-center gap-2.5">
              <Switch
                id="smoking"
                checked={form.smokingAllowed}
                onCheckedChange={(v) => set("smokingAllowed", v)}
                className="data-[state=checked]:bg-[#37EFD1]"
              />
              <Label htmlFor="smoking" className="text-sm text-white/60 cursor-pointer">
                Smoking Allowed
              </Label>
            </div>
            <div className="flex items-center gap-2.5">
              <Switch
                id="pets"
                checked={form.petFriendly}
                onCheckedChange={(v) => set("petFriendly", v)}
                className="data-[state=checked]:bg-[#37EFD1]"
              />
              <Label htmlFor="pets" className="text-sm text-white/60 cursor-pointer">
                Pet Friendly
              </Label>
            </div>
          </div>

          {/* Amenities */}
          {Object.keys(amenityGroups).length > 0 && (
            <>
              <SectionHeading title="Amenities" icon={Maximize2} />
              <div className="space-y-3">
                {Object.entries(amenityGroups).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="text-[10px] text-white/25 font-medium uppercase tracking-widest mb-2">
                      {cat}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((a) => {
                        const selected = form.amenityIds.includes(a.id);
                        return (
                          <Badge
                            key={a.id}
                            variant="outline"
                            onClick={() => toggleAmenity(a.id)}
                            className={cn(
                              "cursor-pointer text-[11px] px-2.5 py-1 transition-all select-none",
                              selected
                                ? "border-[#37EFD1]/30 bg-[#37EFD1]/8 text-[#37EFD1] hover:bg-[#37EFD1]/12"
                                : "border-white/8 bg-transparent text-white/40 hover:border-white/15 hover:text-white/60"
                            )}
                          >
                            {selected && <Check className="inline h-2.5 w-2.5 mr-1" strokeWidth={3} />}
                            {a.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Additional Info */}
          <SectionHeading title="Additional Info" icon={Building2} />

          <div className="space-y-3">
            <div className="space-y-1.5">
              <FieldLabel>Description</FieldLabel>
              <Textarea
                className={cn(field, "resize-none")}
                rows={2}
                placeholder="Short description of the room..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Internal Notes</FieldLabel>
              <Textarea
                className={cn(field, "resize-none")}
                rows={2}
                placeholder="Notes visible only to staff..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          </div>

          <div className="h-2" />
        </form>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/6 bg-[#0E0F14]/60 flex-shrink-0">
          <p className="text-[11px] text-white/20">* Required fields</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="border-white/8 bg-transparent text-white/40 hover:bg-white/5 hover:text-white hover:border-white/15"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-[#C8102E] hover:bg-[#a00d24] text-white"
            >
              {isPending ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Creating…</>
              ) : (
                <><BedDouble className="h-3.5 w-3.5 mr-1.5" />Create Room</>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}