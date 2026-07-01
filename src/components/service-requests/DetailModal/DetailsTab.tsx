import { XCircle, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { serviceRequestService } from "@/service/service-request.service";
import InfoRow from "../shared/InfoRow";
import { ServiceRequest, fmtDate } from "@/types/servicesTypes";

interface Props {
  sr: ServiceRequest;
  onInvalidate: () => void;
  onClose: () => void;
}

export default function DetailsTab({ sr, onInvalidate, onClose }: Props) {
  const canCancel = !["COMPLETED", "CANCELLED"].includes(sr.status);

  const cancelMut = useMutation({
    mutationFn: () => serviceRequestService.cancel(sr.id),
    onSuccess: () => { onInvalidate(); onClose(); },
  });

  return (
    <div className="space-y-3">
      {sr.customer && <InfoRow label="Guest" value={`${sr.customer.firstName} ${sr.customer.lastName} · ${sr.customer.phone}`} />}
      {sr.booking && <InfoRow label="Booking" value={`${sr.booking.bookingNumber}${sr.booking.room ? ` — Room ${sr.booking.room.roomNumber}` : ""}`} />}
      {sr.description && <InfoRow label="Description" value={sr.description} />}
      {sr.notes && <InfoRow label="Notes" value={sr.notes} />}
      {sr.cost != null && <InfoRow label="Cost" value={`RM ${sr.cost.toFixed(2)}`} />}
      {sr.scheduledAt && <InfoRow label="Scheduled" value={fmtDate(sr.scheduledAt)} />}
      {sr.completedAt && <InfoRow label="Completed" value={fmtDate(sr.completedAt)} />}

      {canCancel && (
        <button
          onClick={() => cancelMut.mutate()}
          disabled={cancelMut.isPending}
          className="mt-3 px-4 py-2 text-sm font-sans text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 disabled:opacity-60 flex items-center gap-2 transition-all"
        >
          {cancelMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
          Cancel Request
        </button>
      )}
    </div>
  );
}