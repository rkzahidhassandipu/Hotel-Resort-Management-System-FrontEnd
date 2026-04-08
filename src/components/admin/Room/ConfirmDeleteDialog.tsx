import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteDialogProps {
  open: boolean;
  roomNumber: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function ConfirmDeleteDialog({ open, roomNumber, onConfirm, onCancel, isPending }: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="bg-[#13141A] border-white/8 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white font-semibold">Delete Room #{roomNumber}?</DialogTitle>
        </DialogHeader>
        <p className="text-white/50 text-sm">
          This action cannot be undone. All data associated with this room will be permanently removed.
        </p>
        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={onCancel} disabled={isPending} className="border-white/8 bg-transparent text-white/50 hover:bg-white/5">
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPending} className="bg-[#C8102E] hover:bg-[#a00d24] text-white">
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
            Delete Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}