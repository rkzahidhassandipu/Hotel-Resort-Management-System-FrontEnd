export default function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-white/30 text-xs font-sans min-w-[90px] pt-0.5">{label}</span>
      <span className="text-white/80 text-sm font-sans">{value}</span>
    </div>
  );
}