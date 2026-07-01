"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
}: DatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [open, setOpen] = useState(false);
  const [curYear, setCurYear] = useState(today.getFullYear());
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const wrapRef = useRef<HTMLDivElement>(null);

  const selDate = value ? new Date(value + "T00:00:00") : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const changeMonth = (dir: number) => {
    let m = curMonth + dir, y = curYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setCurMonth(m);
    setCurYear(y);
  };

  const pad = (n: number) => n.toString().padStart(2, "0");

  const selectDay = (day: number, year: number, month: number) => {
    onChange(`${year}-${pad(month + 1)}-${pad(day)}`);
    setOpen(false);
  };

  const displayValue = selDate
    ? `${MONTHS[selDate.getMonth()]} ${selDate.getDate()}, ${selDate.getFullYear()}`
    : null;

  type Cell = { day: number; year: number; month: number; isOther: boolean };
  const cells: Cell[] = [];

  const firstDay = new Date(curYear, curMonth, 1).getDay();
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const daysInPrev = new Date(curYear, curMonth, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const prevM = curMonth === 0 ? 11 : curMonth - 1;
    const prevY = curMonth === 0 ? curYear - 1 : curYear;
    cells.push({ day: daysInPrev - firstDay + 1 + i, year: prevY, month: prevM, isOther: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, year: curYear, month: curMonth, isOther: false });
  }
  const rem = (7 - (cells.length % 7)) % 7;
  for (let n = 1; n <= rem; n++) {
    const nextM = curMonth === 11 ? 0 : curMonth + 1;
    const nextY = curMonth === 11 ? curYear + 1 : curYear;
    cells.push({ day: n, year: nextY, month: nextM, isOther: true });
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full bg-[#0B0C10] border text-sm px-3 py-2.5 pl-9 rounded-[10px] outline-none flex items-center justify-between transition-colors ${
          open ? "border-white/20" : "border-white/8 hover:border-white/15"
        }`}
      >
        <span className="absolute left-3 text-white/25 pointer-events-none text-[15px]">
          📅
        </span>
        <span className={displayValue ? "text-white" : "text-white/25"}>
          {displayValue ?? placeholder}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-white/30 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 bg-[#1A1B21] border border-white/10 rounded-[14px] p-4 w-[280px] shadow-xl">
          <div className="flex items-center justify-between mb-3.5">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="bg-white/5 rounded-lg w-7 h-7 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-white text-[13px] font-semibold">
              {MONTHS[curMonth]} {curYear}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="bg-white/5 rounded-lg w-7 h-7 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1.5">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
              <div key={d} className="text-white/25 text-[11px] text-center py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((cell, i) => {
              const dt = new Date(cell.year, cell.month, cell.day);
              const isToday = dt.getTime() === today.getTime();
              const isSel = selDate && dt.getTime() === selDate.getTime();
              return (
                <button
                  key={i}
                  type="button"
                  disabled={cell.isOther}
                  onClick={() => !cell.isOther && selectDay(cell.day, cell.year, cell.month)}
                  className={`h-8 rounded-lg text-[12px] flex items-center justify-center transition-all ${
                    isSel
                      ? "bg-[#C8102E] text-white font-semibold"
                      : cell.isOther
                      ? "text-white/15 cursor-default"
                      : isToday
                      ? "text-[#37EFD1] font-semibold hover:bg-white/7"
                      : "text-white/60 hover:bg-white/7 hover:text-white"
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex justify-center">
            <button
              type="button"
              onClick={() => {
                const t = new Date();
                selectDay(t.getDate(), t.getFullYear(), t.getMonth());
                setCurYear(t.getFullYear());
                setCurMonth(t.getMonth());
              }}
              className="text-[11px] text-white/30 hover:text-[#37EFD1] transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}