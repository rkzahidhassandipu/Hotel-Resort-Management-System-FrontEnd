import { useState } from "react";
import { Image, Upload, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomService } from "@/service/room.service";
import { toast } from "sonner";

interface UploadImagesDialogProps {
  open: boolean;
  roomId: string;
  onClose: () => void;
}

export function UploadImagesDialog({ open, roomId, onClose }: UploadImagesDialogProps) {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<FileList | null>(null);

  const { mutate: upload, isPending } = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      if (files) {
        Array.from(files).forEach((f) => fd.append("images", f));
      }
      return roomService.uploadImages(roomId, fd);
    },
    onSuccess: () => {
      toast.success("Images uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["rooms"] }); 
      setFiles(null);
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Upload failed. Please try again."); 
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#13141A] border-white/8 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white font-semibold flex items-center gap-2">
            <Image className="h-4 w-4 text-[#37EFD1]" /> 
            Upload Room Images
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
              Select Files
            </Label>
            <div className="relative">
              <Input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange}
                disabled={isPending}
                className="bg-[#0E0F14] border-white/8 text-white/60 cursor-pointer file:bg-white/5 file:text-white/70 file:border-0 file:mr-3 hover:border-white/20 transition-all" 
              />
            </div>
            {files && (
              <p className="text-[11px] text-[#37EFD1]/80 italic">
                {files.length} file(s) selected
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isPending}
            className="border-white/8 bg-transparent text-white/50 hover:bg-white/5 hover:text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => upload()} 
            disabled={isPending || !files?.length} 
            className="bg-[#37EFD1]/10 text-[#37EFD1] border border-[#37EFD1]/20 hover:bg-[#37EFD1]/20 min-w-[100px]"
          >
            {isPending ? (
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