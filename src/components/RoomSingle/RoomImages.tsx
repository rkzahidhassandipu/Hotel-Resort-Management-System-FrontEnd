"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Expand,
} from "lucide-react";

interface RoomImage {
  imageUrl?: string;
  url?: string;
  image?: string;
  caption?: string;
  isPrimary?: boolean;
}

interface RoomImagesProps {
  images?: RoomImage[];
}

export default function RoomImages({ images = [] }: RoomImagesProps) {
  const safeImages = useMemo(() => {
    return (images || [])
      .map((img) => ({
        imageUrl: img.imageUrl || img.url || img.image || "",
        caption: img.caption,
        isPrimary: img.isPrimary,
      }))
      .filter((img) => img.imageUrl);
  }, [images]);

  const primaryIndex = safeImages.findIndex((i) => i.isPrimary);
  const [activeIdx, setActiveIdx] = useState(
    primaryIndex >= 0 ? primaryIndex : 0
  );

  const [lightbox, setLightbox] = useState(false);

  if (!safeImages.length) {
    return (
      <div className="w-full h-72 rounded-xl border border-gray-800 bg-muted flex flex-col items-center justify-center gap-3 mb-6 text-muted-foreground">
        <div className="p-4 rounded-2xl bg-muted/50">
          <ImageOff className="h-8 w-8" />
        </div>
        <p className="text-sm">No images available</p>
      </div>
    );
  }

  const active = safeImages[activeIdx];
  const hasPrev = activeIdx > 0;
  const hasNext = activeIdx < safeImages.length - 1;

  return (
    <>
      <div className="mb-6 space-y-3">
        {/* Main Image */}
        <div className="relative w-full overflow-hidden rounded-xl border border-border bg-muted group aspect-[16/9]">
          <img
            src={active.imageUrl}
            alt={active.caption ?? "Room image"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {active.caption && (
            <p className="absolute bottom-3 left-4 text-xs text-white/80 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {active.caption}
            </p>
          )}

          <span className="absolute top-3 right-3 text-xs text-white/70 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full font-mono">
            {activeIdx + 1} / {safeImages.length}
          </span>

          <button
            onClick={() => setLightbox(true)}
            className="absolute top-3 left-3 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Expand className="h-4 w-4" />
          </button>

          {hasPrev && (
            <button
              onClick={() => setActiveIdx((i) => i - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {hasNext && (
            <button
              onClick={() => setActiveIdx((i) => i + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {active.isPrimary && (
            <span className="absolute bottom-3 right-4 text-[10px] font-medium text-gold-500 bg-gold-500/10 border border-gold-500/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
              Primary
            </span>
          )}
        </div>

        {/* Thumbnails */}
        {safeImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
            {safeImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={cn(
                  "relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200",
                  idx === activeIdx
                    ? "border-gold-500 ring-1 ring-gold-500/30 scale-[1.04]"
                    : "border-border opacity-60 hover:opacity-90"
                )}
              >
                <img
                  src={img.imageUrl}
                  alt={img.caption ?? `View ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={active.imageUrl}
              alt={active.caption ?? "Room image"}
              className="w-full max-h-[85vh] object-contain rounded-xl"
            />

            {hasPrev && (
              <button
                onClick={() => setActiveIdx((i) => i - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {hasNext && (
              <button
                onClick={() => setActiveIdx((i) => i + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={() => setLightbox(false)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center text-sm"
            >
              ✕
            </button>

            {active.caption && (
              <p className="text-center text-sm text-white/60 mt-3">
                {active.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}