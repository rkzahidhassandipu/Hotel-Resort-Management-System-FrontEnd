"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TimePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function TimePicker({
  value,
  onChange,
  placeholder = "Pick a time",
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const initH = value ? parseInt(value.split(":")[0]) : 8;
  const initM = value ? parseInt(value.split(":")[1]) : 0;

  const [hour, setHour] = useState(initH);
  const [minute, setMinute] = useState(initM);

  useEffect(() => {
    if (value) {
      setHour(parseInt(value.split(":")[0]));
      setMinute(parseInt(value.split(":")[1]));
    }
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const changeHour = (dir: number) => {
    const h = (hour + dir + 24) % 24;
    setHour(h);
    onChange(`${pad(h)}:${pad(minute)}`);
  };

  const changeMinute = (dir: number) => {
    const m = (minute + dir * 5 + 60) % 60;
    setMinute(m);
    onChange(`${pad(hour)}:${pad(m)}`);
  };

  const displayValue = value ? `${pad(hour)}:${pad(minute)}` : null;

  const QUICK = ["08:00", "09:00", "12:00", "14:00", "17:00", "18:00", "20:00", "22:00"];

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full bg-[#0B0C10] border text-sm px-3 py-2.5 pl-9 rounded-[10px] outline-none flex items-center justify-between transition-colors ${
          open ? "border-white/20" : "border-white/8 hover:border-white/15"
        }`}
      >
        <span className="absolute left-3 pointer-events-none text-white/25 text-[15px]">🕐</span>
        <span className={displayValue ? "text-white font-mono tracking-widest" : "text-white/25"}>
          {displayValue ?? placeholder}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-white/30 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 bg-[#1A1B21] border border-white/10 rounded-[14px] p-4 w-[220px] shadow-xl">

          {/* Spinner */}
          <div className="flex items-center justify-center gap-3 mb-4">

            {/* Hour */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => changeHour(1)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <div className="w-14 h-10 bg-[#0B0C10] border border-white/8 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-mono font-semibold">{pad(hour)}</span>
              </div>
              <button
                type="button"
                onClick={() => changeHour(-1)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <span className="text-white/25 text-[10px] uppercase tracking-widest mt-0.5">hr</span>
            </div>

            <span className="text-white/40 text-2xl font-mono mb-4">:</span>

            {/* Minute */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => changeMinute(1)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <div className="w-14 h-10 bg-[#0B0C10] border border-white/8 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-mono font-semibold">{pad(minute)}</span>
              </div>
              <button
                type="button"
                onClick={() => changeMinute(-1)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <span className="text-white/25 text-[10px] uppercase tracking-widest mt-0.5">min</span>
            </div>
          </div>

          {/* Quick picks */}
          <div className="border-t border-white/5 pt-3">
            <p className="text-white/25 text-[10px] uppercase tracking-widest mb-2">Quick pick</p>
            <div className="grid grid-cols-4 gap-1">
              {QUICK.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    const [h, m] = t.split(":").map(Number);
                    setHour(h);
                    setMinute(m);
                    onChange(t);
                    setOpen(false);
                  }}
                  className={`py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                    value === t
                      ? "bg-[#C8102E]/15 border border-[#C8102E]/40 text-[#C8102E]"
                      : "bg-white/4 border border-white/6 text-white/40 hover:text-white hover:bg-white/8"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Confirm */}
          <button
            type="button"
            onClick={() => {
              onChange(`${pad(hour)}:${pad(minute)}`);
              setOpen(false);
            }}
            className="mt-3 w-full py-2 bg-[#C8102E] hover:bg-[#a00d24] text-white text-xs font-semibold rounded-lg transition-all"
          >
            Set {pad(hour)}:{pad(minute)}
          </button>
        </div>
      )}
    </div>
  );
}