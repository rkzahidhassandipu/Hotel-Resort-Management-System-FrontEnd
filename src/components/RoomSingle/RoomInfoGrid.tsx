"use client";

import {
  BedDouble,
  Users,
  Ruler,
  Layers,
  Wind,
  PawPrint,
  CigaretteOff,
  Eye,
  DollarSign,
} from "lucide-react";
import InfoPill from "./InfoPill";

interface RoomInfoGridProps {
  room?: any;
}

export default function RoomInfoGrid({ room }: RoomInfoGridProps) {
  if (!room) return null;

  const price =
    room?.category?.basePrice != null
      ? `RM ${Number(room.category.basePrice).toLocaleString()}`
      : "—";

  const floor = room?.floor ? `Floor ${room.floor}` : "—";
  const bedType = room?.bedType || "—";
  const guests = room?.maxOccupancy
    ? `${room.maxOccupancy} guests`
    : "—";
  const size = room?.sizeInSqFt
    ? `${room.sizeInSqFt} sq ft`
    : null;
  const view = room?.view || "Standard";

  const smokingValue =
    room?.smokingAllowed === true
      ? "Allowed"
      : room?.smokingAllowed === false
      ? "No Smoking"
      : "—";

  const petValue =
    room?.petFriendly === true
      ? "Pet Friendly"
      : room?.petFriendly === false
      ? "No Pets"
      : "—";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
      <InfoPill icon={Layers} label="Floor" value={floor} />

      <InfoPill icon={BedDouble} label="Bed Type" value={bedType} />

      <InfoPill icon={Users} label="Max Guests" value={guests} />

      <InfoPill
        icon={DollarSign}
        label="Rate / Night"
        value={price}
        highlight
      />

      {size && (
        <InfoPill icon={Ruler} label="Size" value={size} />
      )}

      <InfoPill icon={Eye} label="View" value={view} />

      <InfoPill
        icon={room?.smokingAllowed ? Wind : CigaretteOff}
        label="Smoking"
        value={smokingValue}
      />

      <InfoPill
        icon={PawPrint}
        label="Pets"
        value={petValue}
      />
    </div>
  );
}