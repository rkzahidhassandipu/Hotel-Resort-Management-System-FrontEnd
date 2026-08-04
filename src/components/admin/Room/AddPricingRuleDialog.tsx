import { useState, useRef, useEffect } from "react";
import { DollarSign, Loader2, CalendarIcon, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomService } from "@/service/room.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddPricingRuleDialogProps {
  open: boolean;
  roomId: string;
  onClose: () => void;
}

const EMPTY_FORM = { name: "", pricePerNight: "", reason: "" };

// ── Mini Calendar ──────────────────────────────────────────
function MiniCalendar({
  selected,
  onSelect,
  minDate,
}: {
  selected: Date | undefined;
  onSelect: (d: Date) => void;
  minDate?: Date;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  return (
    <div className="bg-[#1A1B21] border border-white/10 rounded-xl p-3 w-[260px] shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-white">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] text-white/30 py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {/* Empty cells */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(viewYear, viewMonth, day);
          const isSelected =
            selected &&
            selected.getDate() === day &&
            selected.getMonth() === viewMonth &&
            selected.getFullYear() === viewYear;
          const isToday =
            today.getDate() === day &&
            today.getMonth() === viewMonth &&
            today.getFullYear() === viewYear;
          const isDisabled = minDate ? date < minDate : date < new Date(today.setHours(0,0,0,0));

          return (
            <button
              key={day}
              disabled={isDisabled}
              onClick={() => onSelect(date)}
              className={cn(
                "h-8 w-8 mx-auto rounded-lg text-xs transition-colors",
                isSelected && "bg-[#C8102E] text-white font-semibold",
                !isSelected && isToday && "border border-[#37EFD1] text-[#37EFD1]",
                !isSelected && !isToday && !isDisabled && "text-white/70 hover:bg-white/10",
                isDisabled && "text-white/20 cursor-not-allowed",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Date Picker ────────────────────────────────────────────
function DatePicker({
  label,
  value,
  onChange,
  minDate,
}: {
  label: string;
  value: Date | undefined;
  onChange: (d: Date) => void;
  minDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="space-y-1.5" ref={ref}>
      <Label className="text-white/40 text-[10px] uppercase tracking-wider">{label}</Label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors text-left",
            "bg-[#0E0F14] border-white/10 hover:border-white/20",
            value ? "text-white" : "text-white/30"
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-white/40" />
          {value ? fmt(value) : "Pick a date"}
        </button>

        {open && (
          <div className="absolute z-50 mt-1 left-0">
            <MiniCalendar
              selected={value}
              minDate={minDate}
              onSelect={(d) => { onChange(d); setOpen(false); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
export function AddPricingRuleDialog({ open, roomId, onClose }: AddPricingRuleDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const reset = () => {
    setForm(EMPTY_FORM);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // ─────────────────────────────
  // Fetch existing pricing rules
  // ─────────────────────────────
  const { data: rulesRes, isLoading: isLoadingRules } = useQuery({
    queryKey: ["pricing-rules", roomId],
    queryFn: () => roomService.getPricingRules(roomId),
    enabled: open && !!roomId,
  });

  const rules = rulesRes?.data?.data ?? rulesRes?.data ?? [];

  // ─────────────────────────────
  // Add rule
  // ─────────────────────────────
  const { mutate: addRule, isPending } = useMutation({
    mutationFn: () =>
      roomService.addPricingRule(roomId, {
        name: form.name,
        pricePerNight: Number(form.pricePerNight),
        startDate: startDate!.toISOString(),
        endDate: endDate!.toISOString(),
        reason: form.reason || undefined,
      }),
    onSuccess: () => {
      toast.success("Pricing rule added successfully");
      queryClient.invalidateQueries({ queryKey: ["pricing-rules", roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      reset();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to add pricing rule");
    },
  });

  // ─────────────────────────────
  // Delete rule
  // ─────────────────────────────
  const { mutate: removeRule, isPending: isDeleting } = useMutation({
    mutationFn: (ruleId: string) => roomService.deletePricingRule(roomId, ruleId),
    onSuccess: () => {
      toast.success("Pricing rule deleted");
      queryClient.invalidateQueries({ queryKey: ["pricing-rules", roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to delete rule");
    },
  });

  const handleSubmit = () => {
    if (!form.name || !form.pricePerNight || !startDate || !endDate) {
      toast.error("Name, price, start and end date are required");
      return;
    }
    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }
    addRule();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#13141A] border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <DollarSign className="h-4 w-4 text-[#37EFD1]" />
            Pricing Rules
          </DialogTitle>
        </DialogHeader>

        {/* ─────────────────────────────
            EXISTING RULES LIST
        ───────────────────────────── */}
        {isLoadingRules ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-white/30" />
          </div>
        ) : rules.length > 0 ? (
          <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
            <Label className="text-white/40 text-[10px] uppercase tracking-wider">
              Existing Rules
            </Label>
            {rules.map((rule: any) => (
              <div
                key={rule.id}
                className="flex items-center justify-between bg-[#0E0F14] border border-white/10 rounded-md px-3 py-2 text-sm"
              >
                <div>
                  <p className="text-white">{rule.name}</p>
                  <p className="text-white/30 text-xs">
                    RM {rule.pricePerNight} •{" "}
                    {new Date(rule.startDate).toLocaleDateString()} –{" "}
                    {new Date(rule.endDate).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={isDeleting}
                  onClick={() => removeRule(rule.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-xs text-white/30 py-2">
            No pricing rules yet
          </p>
        )}

        {/* ─────────────────────────────
            ADD NEW RULE FORM
        ───────────────────────────── */}
        <div className="space-y-4 py-2 border-t border-white/5 pt-4">
          <div className="space-y-1.5">
            <Label className="text-white/40 text-[10px] uppercase tracking-wider">Rule Name *</Label>
            <Input
              placeholder="e.g. Weekend Surge"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="bg-[#0E0F14] border-white/10 text-white focus:border-[#37EFD1]/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/40 text-[10px] uppercase tracking-wider">Price Per Night (RM) *</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="350.00"
              value={form.pricePerNight}
              onChange={(e) => setForm((f) => ({ ...f, pricePerNight: e.target.value }))}
              className="bg-[#0E0F14] border-white/10 text-white focus:border-[#37EFD1]/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              label="Start Date *"
              value={startDate}
              onChange={(d) => { setStartDate(d); if (endDate && d >= endDate) setEndDate(undefined); }}
            />
            <DatePicker
              label="End Date *"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate ? new Date(startDate.getTime() + 86400000) : undefined}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/40 text-[10px] uppercase tracking-wider">Reason (optional)</Label>
            <Input
              placeholder="e.g. Public holiday"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              className="bg-[#0E0F14] border-white/10 text-white focus:border-[#37EFD1]/50"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => { reset(); onClose(); }}
            disabled={isPending}
            className="border-white/10 text-white/50 hover:bg-white/5 hover:text-white"
          >
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-[#C8102E] hover:bg-[#a00d24] text-white min-w-[100px]"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}