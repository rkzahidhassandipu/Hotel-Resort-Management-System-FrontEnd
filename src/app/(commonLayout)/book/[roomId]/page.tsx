"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { bookingService } from "@/service/booking.service";
import { getCookie } from "@/lib/cookieUtils";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function fmt(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Calendar({
  checkIn,
  checkOut,
  onPick,
}: {
  checkIn: Date | null;
  checkOut: Date | null;
  onPick: (d: Date) => void;
}) {
  const [vy, setVy] = useState(new Date().getFullYear());
  const [vm, setVm] = useState(new Date().getMonth());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDay = new Date(vy, vm, 1).getDay();
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();

  const prev = () => {
    if (vm === 0) {
      setVm(11);
      setVy((y) => y - 1);
    } else setVm((m) => m - 1);
  };
  const next = () => {
    if (vm === 11) {
      setVm(0);
      setVy((y) => y + 1);
    } else setVm((m) => m + 1);
  };

  return (
    <div className="bg-[#0B0C10] border border-white/8 rounded-xl p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prev}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 border border-white/8 text-white/70 hover:bg-[#37EFD1]/10 hover:border-[#37EFD1]/30 hover:text-[#37EFD1] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-white">
          {MONTHS[vm]} {vy}
        </span>
        <button
          type="button"
          onClick={next}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 border border-white/8 text-white/70 hover:bg-[#37EFD1]/10 hover:border-[#37EFD1]/30 hover:text-[#37EFD1] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] uppercase tracking-wider text-white/30 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const dt = new Date(vy, vm, d);
          const isPast = dt < today;
          const isToday = dt.getTime() === today.getTime();
          const isCIn = checkIn && dt.getTime() === checkIn.getTime();
          const isCOut = checkOut && dt.getTime() === checkOut.getTime();
          const inRange = checkIn && checkOut && dt > checkIn && dt < checkOut;

          let cls =
            "h-8 flex items-center justify-center text-[13px] rounded-lg transition-all ";
          if (isPast) cls += "text-white/20 cursor-default pointer-events-none";
          else if (isCIn)
            cls +=
              "bg-[#37EFD1] text-[#0B0C10] font-medium rounded-r-none cursor-pointer";
          else if (isCOut)
            cls +=
              "bg-[#37EFD1] text-[#0B0C10] font-medium rounded-l-none cursor-pointer";
          else if (inRange)
            cls +=
              "bg-[#37EFD1]/12 text-[#37EFD1]/90 rounded-none cursor-pointer";
          else if (isToday)
            cls += "text-[#37EFD1] font-medium cursor-pointer hover:bg-white/6";
          else cls += "text-white/75 cursor-pointer hover:bg-white/6";

          if (isCIn && isCOut) {
            cls =
              cls.replace("rounded-r-none", "").replace("rounded-l-none", "") +
              " rounded-lg";
          }

          return (
            <button
              key={d}
              type="button"
              disabled={isPast}
              onClick={() => onPick(dt)}
              className={cls}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BookingPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const isLoggedIn = !!getCookie("accessToken");

  // Calendar state
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  const [selecting, setSelecting] = useState<"in" | "out">("in");

  // Form state
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  const handleDateBoxClick = (which: "in" | "out") => {
    setSelecting(which);
    setCalOpen(true);
  };

  const handlePick = (dt: Date) => {
    if (selecting === "in") {
      setCheckIn(dt);
      setCheckOut(null);
      setSelecting("out");
    } else {
      if (checkIn && dt <= checkIn) {
        // clicked before or on check-in → restart selection
        setCheckIn(dt);
        setCheckOut(null);
        setSelecting("out");
      } else {
        setCheckOut(dt);
        setCalOpen(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const token = getCookie("accessToken");
    if (!token) {
      router.push(`/login?redirect=/book/${roomId}`);
      return;
    }

    // ১. এখানে jwtDecode ব্যবহার করে ID বের করছি
    let customerId;
    try {
      const decoded: any = jwtDecode(token);
      // আপনার টোকেনে ID যে নামে আছে (id, sub, বা _id) সেটি এখানে দিন
      customerId =
        decoded?.id || decoded?.sub || decoded?._id || decoded?.userId;
    } catch (err) {
      setError("Session invalid. Please log in again.");
      return;
    }

    if (!checkIn || !checkOut || nights < 1) {
      setError("Please select valid check-in and check-out dates.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        roomId: decodeURIComponent(roomId),
        checkInDate: checkIn.toISOString(),
        checkOutDate: checkOut.toISOString(),
        adults,
        children,
        ...(specialRequests.trim() && {
          specialRequests: specialRequests.trim(),
        }),
      };

      console.log("Sending Payload:", payload);

      const res = await bookingService.create(payload);
      const booking = res.data?.data ?? res.data;

      if (!booking?.id) throw new Error("Invalid booking response.");
      toast("Booking created. Please complete payment to confirm.");

      router.push(`/book/${roomId}/payment?bookingId=${booking.id}`);
    } catch (err: any) {
      const data = err?.response?.data ?? err?.data ?? err;
      setError(data?.message ?? "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-3xl text-white font-display font-semibold mb-2">
          Book Your Stay
        </h1>
        <p className="text-[#37EFD1] text-sm mb-6">
          Room: {decodeURIComponent(roomId)}
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-[#1A1B21] border border-white/8 rounded-2xl p-6 space-y-6"
        >
          {error && (
            <div className="text-[#37EFD1] text-sm bg-[#37EFD1]/10 p-3 rounded space-y-1">
              <p>{error}</p>
              {/* Remove this block after debugging */}
              <p className="text-white/30 text-xs break-all" id="debug-error" />
            </div>
          )}

          {/* ── Dates ── */}
          <div>
            <label className="text-white/50 text-xs uppercase font-sans mb-2 block tracking-widest">
              Dates
            </label>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => handleDateBoxClick("in")}
                className={`bg-[#0B0C10] border rounded-xl p-3 text-left transition-colors ${
                  selecting === "in" && calOpen
                    ? "border-[#37EFD1]/40"
                    : "border-white/8"
                }`}
              >
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                  Check-in
                </p>
                <p
                  className={`text-sm ${checkIn ? "text-white" : "text-white/25"}`}
                >
                  {checkIn ? fmt(checkIn) : "Select date"}
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleDateBoxClick("out")}
                className={`bg-[#0B0C10] border rounded-xl p-3 text-left transition-colors ${
                  selecting === "out" && calOpen
                    ? "border-[#37EFD1]/40"
                    : "border-white/8"
                }`}
              >
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                  Check-out
                </p>
                <p
                  className={`text-sm ${checkOut ? "text-white" : "text-white/25"}`}
                >
                  {checkOut ? fmt(checkOut) : "Select date"}
                </p>
              </button>
            </div>

            {nights > 0 && (
              <p className="text-[#37EFD1] text-sm bg-[#37EFD1]/10 border border-[#37EFD1]/20 rounded-full px-4 py-1.5 inline-block mb-3">
                {nights} night{nights > 1 ? "s" : ""} selected
              </p>
            )}

            {calOpen && (
              <Calendar
                checkIn={checkIn}
                checkOut={checkOut}
                onPick={handlePick}
              />
            )}
          </div>

          {/* ── Guests ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/50 text-xs uppercase font-sans mb-1 block">
                Adults
              </label>
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans pl-3 py-3 rounded-lg focus:border-[#37EFD1]/40 transition-colors"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} Adult{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-white/50 text-xs uppercase font-sans mb-1 block">
                Children
              </label>
              <select
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans pl-3 py-3 rounded-lg focus:border-[#37EFD1]/40 transition-colors"
              >
                {[0, 1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n} Child{n !== 1 ? "ren" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Special Requests ── */}
          <div>
            <label className="text-white/50 text-xs uppercase font-sans mb-1 block">
              Special Requests{" "}
              <span className="text-white/25 normal-case">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Early check-in, dietary requirements..."
              className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3 py-3 rounded-lg focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20 resize-none"
            />
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-[#37EFD1] hover:bg-[#00FFD5] text-[#0B0C10] py-3.5 rounded-lg font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <>
                <ArrowRight className="h-4 w-4" /> Continue
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
