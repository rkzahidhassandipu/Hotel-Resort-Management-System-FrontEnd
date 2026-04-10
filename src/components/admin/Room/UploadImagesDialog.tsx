"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { X, UploadCloud, Trash2, RefreshCw, Loader2, ImageIcon, Images as ImagesIcon, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { roomService } from "@/service/room.service";
import { Room } from "@/types";
import { cn } from "@/lib/utils";

interface UploadImagesDialogProps {
  open: boolean;
  roomId: string;
  onClose: () => void;
}

export function UploadImagesDialog({ open, roomId, onClose }: UploadImagesDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [updatingImageId, setUpdatingImageId] = useState<string | null>(null);


  const { data: roomRes, isLoading: isRoomLoading, refetch } = useQuery({
  queryKey: ["rooms", roomId],
  queryFn: () => roomService.getById(roomId),
  enabled: !!roomId && open,
});

  const images = roomRes?.data?.data?.images || [];

  const { mutate: uploadNewImages } = useMutation({
  mutationFn: (formData: FormData) => roomService.uploadImages(roomId, formData),
  onSuccess: async () => {
    toast.success("Images added successfully");
    await queryClient.invalidateQueries({ queryKey: ["rooms"] });
    refetch(); 
  },
  onSettled: () => setUploading(false),
});

  const { mutate: updateExistingImage } = useMutation({
    mutationFn: ({ imageId, formData }: { imageId: string; formData: FormData }) => 
      roomService.setPrimaryImage(roomId, imageId), 
    onSuccess: () => {
      toast.success("Image updated successfully");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onSettled: () => setUpdatingImageId(null),
  });

  const { mutate: deleteImage } = useMutation({
  mutationFn: (imageId: string) => roomService.deleteImage(roomId, imageId),
  onSuccess: async () => {
    toast.success("Image deleted");
    await queryClient.invalidateQueries({ queryKey: ["rooms"] });
    refetch(); 
  },
});

  // Handlers
  const handleNewUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length) {
      setUploading(true);
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("images", f));
      uploadNewImages(formData);
    }
  };

  const handleUpdateClick = (imageId: string) => {
    setUpdatingImageId(imageId);
    updateInputRef.current?.click();
  };

  const handleUpdateFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && updatingImageId) {
      const formData = new FormData();
      formData.append("image", file);
      updateExistingImage({ imageId: updatingImageId, formData });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#13141A] border-white/5 text-white max-w-2xl max-h-[85vh] overflow-y-auto p-0 shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#13141A] z-10">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <ImagesIcon className="h-5 w-5 text-[#37EFD1]" />
            Manage Room Images
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-white/5">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Hidden Input for Update */}
        <input type="file" ref={updateInputRef} onChange={handleUpdateFileChange} accept="image/*" className="hidden" />

        <div className="p-6 space-y-8">
          
          {/* ১. Existing Images Grid */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Current Gallery</h3>
            
            {isRoomLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#37EFD1]" /></div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/5 rounded-xl bg-white/[0.02]">
                <ImageIcon className="h-8 w-8 text-white/10 mb-2" />
                <p className="text-xs text-white/20">No images found for this room</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((img: any) => (
                  <div key={img.id} className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-white/10 bg-white/5">
                    <Image src={img.imageUrl} alt="Room" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border-0" 
                        onClick={() => handleUpdateClick(img.id)}
                        disabled={updatingImageId === img.id}
                      >
                        {updatingImageId === img.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="h-8 w-8 rounded-full bg-red-500/20 hover:bg-red-500/40 border-0"
                        onClick={() => deleteImage(img.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ২. Bottom Upload Section */}
          <div className="pt-6 border-t border-white/5">
            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Add More</h3>
            
            <div 
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3",
                uploading ? "border-[#37EFD1]/30 bg-[#37EFD1]/5" : "border-white/5 bg-white/[0.02] hover:border-[#37EFD1]/20 hover:bg-[#37EFD1]/5"
              )}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-[#37EFD1]" />
                  <p className="text-xs text-[#37EFD1]">Uploading...</p>
                </>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-white/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-white/70">Click to upload new photos</p>
                    <p className="text-[10px] text-white/30">PNG, JPG or WEBP up to 5MB</p>
                  </div>
                </>
              )}
            </div>
            <input type="file" ref={fileInputRef} multiple onChange={handleNewUpload} className="hidden" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}