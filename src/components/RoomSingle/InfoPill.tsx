"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InfoPillProps {
  icon: React.ElementType; // Icon component from lucide-react
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}

export default function InfoPill({
  icon: Icon,
  label,
  value,
  highlight = false,
}: InfoPillProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 text-[#37EFD1] px-4 py-3 rounded-xl border bg-[#37EFD1]/5 border border-[#37EFD1]/20 rounded-xl px-5 py-3"
      )}
    >
      {/* Icon wrapper */}
      <div
        className={cn(
          "p-1.5 rounded-lg",
          highlight ? "bg-gold-500/10" : "bg-muted"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            highlight ? "text-gold-500" : "text-muted-foreground"
          )}
        />
      </div>

      {/* Text content */}
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
          {label}
        </p>
        <p
          className={cn(
            "text-sm font-medium truncate",
            highlight ? "text-gold-500" : "text-foreground"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}