"use client";

import { useState } from "react";
import { Image, Upload, Loader2, Star, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomService } from "@/service/room.service";
import { toast } from "sonner";

interface UploadImagesDialogProps {
  open: boolean;
  roomId: string;
  onClose: () => void;
}

export function UploadImagesDialog({
  open,
  roomId,
  onClose,
}: UploadImagesDialogProps) {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<FileList | null>(null);

  // ─────────────────────────────
  // Fetch room (images included)
  // ─────────────────────────────
  const { data } = useQuery({
    queryKey: ["room-images", roomId],
    queryFn: () => roomService.getById(roomId),
    enabled: !!roomId && open,
  });

  const room = data?.data?.data ?? data?.data;
  const images = room?.images ?? [];

  // ─────────────────────────────
  // Upload Images
  // ─────────────────────────────
  const { mutate: upload, isPending: isUploading } = useMutation({
    mutationFn: () => {
      const fd = new FormData();

      if (files?.length) {
        Array.from(files).forEach((file) => {
          fd.append("images", file);
        });
      }

      return roomService.uploadImages(roomId, fd);
    },
    onSuccess: () => {
      toast.success("Images uploaded successfully");
      setFiles(null);

      queryClient.invalidateQueries({ queryKey: ["room-images", roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: () => {
      toast.error("Upload failed");
    },
  });

  // ─────────────────────────────
  // Set Primary Image
  // ─────────────────────────────
  const { mutate: setPrimary } = useMutation({
    mutationFn: (imageId: string) =>
      roomService.setPrimaryImage(roomId, imageId),
    onSuccess: () => {
      toast.success("Primary image updated");
      queryClient.invalidateQueries({ queryKey: ["room-images", roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: () => {
      toast.error("Failed to set primary image");
    },
  });

  // ─────────────────────────────
  // Delete Image
  // ─────────────────────────────
  const { mutate: deleteImage } = useMutation({
    mutationFn: (imageId: string) =>
      roomService.deleteImage(roomId, imageId),
    onSuccess: () => {
      toast.success("Image deleted");
      queryClient.invalidateQueries({ queryKey: ["room-images", roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: () => {
      toast.error("Delete failed");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFiles(e.target.files);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#13141A] border-white/10 text-white max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-4 w-4 text-[#37EFD1]" />
            Manage Room Images
          </DialogTitle>
        </DialogHeader>

        {/* ─────────────────────────────
            IMAGE GRID
        ───────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {images.length === 0 ? (
            <p className="col-span-3 text-center text-sm text-white/30 py-6">
              No images found
            </p>
          ) : (
            images.map((img: any) => (
              <div
                key={img.id}
                className="relative group rounded-lg overflow-hidden border border-white/10"
              >
                <img
                  src={img.imageUrl}
                  className="h-24 w-full object-cover"
                  alt="room"
                />

                {img.isPrimary && (
                  <div className="absolute top-1 left-1 text-[10px] bg-[#37EFD1] text-black px-2 py-0.5 rounded">
                    Primary
                  </div>
                )}

                {/* Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setPrimary(img.id)}
                  >
                    <Star className="h-4 w-4 text-yellow-400" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteImage(img.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ─────────────────────────────
            UPLOAD SECTION
        ───────────────────────────── */}
        <div className="space-y-2 pt-4">
          <Label className="text-xs text-white/40 uppercase tracking-widest">
            Upload New Images
          </Label>

          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="bg-[#0E0F14] border-white/10 text-white/60"
          />

          {files && (
            <p className="text-xs text-[#37EFD1]">
              {files.length} file(s) selected
            </p>
          )}
        </div>

        {/* ─────────────────────────────
            FOOTER
        ───────────────────────────── */}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/10"
          >
            Close
          </Button>

          <Button
            onClick={() => upload()}
            disabled={!files?.length || isUploading}
            className="bg-[#37EFD1]/10 text-[#37EFD1]"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}