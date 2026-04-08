import { useState } from "react";
import { DollarSign, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomService } from "@/service/room.service";
import { toast } from "sonner"; // Sonner ইম্পোর্ট

interface AddPricingRuleDialogProps {
  open: boolean;
  roomId: string;
  onClose: () => void;
}

export function AddPricingRuleDialog({ open, roomId, onClose }: AddPricingRuleDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ 
    name: "", 
    multiplier: "", 
    startDate: "", 
    endDate: "" 
  });

  const { mutate: addRule, isPending } = useMutation({
    mutationFn: () => 
      roomService.addPricingRule(roomId, {
        ...form, 
        multiplier: Number(form.multiplier)
      }),
    onSuccess: () => {
      toast.success("Pricing rule added successfully"); // Sonner Success
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      onClose();
      setForm({ name: "", multiplier: "", startDate: "", endDate: "" }); // Reset form
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add pricing rule"); // Sonner Error
    }
  });

  const handleSubmit = () => {
    if (!form.name || !form.multiplier) {
      toast.error("Please fill in all required fields");
      return;
    }
    addRule();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#13141A] border-white/8 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <DollarSign className="h-4 w-4 text-[#37EFD1]" /> 
            Add Pricing Rule
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-white/40 text-[10px] uppercase tracking-wider">Rule Name</Label>
            <Input 
              placeholder="e.g. Weekend Surge"
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              className="bg-[#0E0F14] border-white/8 text-white focus:border-[#37EFD1]/50 transition-colors" 
            />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-white/40 text-[10px] uppercase tracking-wider">Multiplier (e.g. 1.5)</Label>
            <Input 
              type="number" 
              step="0.1"
              placeholder="1.0"
              value={form.multiplier} 
              onChange={e => setForm({...form, multiplier: e.target.value})} 
              className="bg-[#0E0F14] border-white/8 text-white focus:border-[#37EFD1]/50 transition-colors" 
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isPending}
            className="border-white/8 text-white/50 hover:bg-white/5 hover:text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isPending} 
            className="bg-[#C8102E] hover:bg-[#a00d24] text-white min-w-[100px]"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Add Rule"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}