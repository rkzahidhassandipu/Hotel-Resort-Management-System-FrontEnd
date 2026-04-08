"use client";

import { cn } from "@/lib/utils";

interface Props {
  room: any;
  statusStyle: string;
}

export default function RoomHeader({ room, statusStyle }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 mb-2">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium border",
              statusStyle
            )}
          >
            {room.status?.replace(/_/g, " ")}
          </span>

          {room.category?.name && (
            <span className="text-xs text-white/70 bg-white/5 px-2.5 py-0.5 rounded-md border border-white/10">
              {room.category.name}
            </span>
          )}
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-light text-white leading-tight">
          Room <span className="text-[#37EFD1]">{room.roomNumber}</span>
        </h1>

        <p className="text-white/50 text-sm mt-2 max-w-xl leading-relaxed">
          {room.description ?? "No description provided for this room."}
        </p>
      </div>

      <div className="flex-shrink-0 text-right hidden sm:block">
        <div className="bg-[#37EFD1]/5 border border-[#37EFD1]/20 rounded-xl px-5 py-3">
          <p className="text-xs text-white/50 mb-0.5">Base rate</p>

          <p className="text-2xl font-display font-light text-[#37EFD1]">
            RM {room.category?.basePrice?.toLocaleString() ?? "—"}
          </p>

          <p className="text-[10px] text-white/40 mt-0.5">
            per night
          </p>

          {room.category?.weekendPrice && (
            <p className="text-xs text-white/50 mt-1 border-t border-white/10 pt-1">
              Weekend: RM {room.category.weekendPrice.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}