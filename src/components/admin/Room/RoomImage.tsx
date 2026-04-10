"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomService } from "@/service/room.service";
import { toast } from "sonner";

interface RoomImageProps {
  imageUrl?: string;
  images?: { imageUrl: string }[]; // ✅ fixed type
  roomId?: string;
  alt?: string;
  className?: string;
  onSuccess?: () => void;
}

export const RoomImage: React.FC<RoomImageProps> = ({
  imageUrl: initialImageUrl,
  images = [],
  roomId,
  alt = "Room Preview",
  className,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadImage } = useMutation({
    mutationFn: (formData: FormData) =>
      roomService.uploadImages(roomId!, formData),
    onSuccess: () => {
      toast.success("Image updated successfully");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Upload failed");
    },
    onSettled: () => setIsUpdating(false),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("File size too large (Max 2MB)");
    }

    setIsUpdating(true);
    const formData = new FormData();
    formData.append("images", file);
    uploadImage(formData);
  };

  const wrapperClass = cn(
    "relative h-10 w-14 overflow-hidden rounded-md border border-white/10 bg-white/5 shadow-inner group cursor-pointer",
    "transition-all duration-300 hover:scale-105",
    className
  );

  const imageCount = images?.length ?? 0;

  return (
    <div
      className={wrapperClass}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {(isLoading || isUpdating) && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0B0C10]/60 z-20">
          <Loader2 className="h-4 w-4 animate-spin text-[#37EFD1]" />
        </div>
      )}

      {/* image count */}
      {!isUpdating && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
          <span className="text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded border border-white/10">
            {imageCount}
          </span>
        </div>
      )}

      {!initialImageUrl || hasError ? (
        <div className="flex h-full items-center justify-center text-white/10">
          <ImageIcon className="h-5 w-5" />
        </div>
      ) : (
        <Image
          src={initialImageUrl}
          alt={alt}
          fill
          className={cn(
            "object-cover transition-transform duration-500",
            isLoading ? "blur-md" : "blur-0 group-hover:scale-110"
          )}
          sizes="60px"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
};