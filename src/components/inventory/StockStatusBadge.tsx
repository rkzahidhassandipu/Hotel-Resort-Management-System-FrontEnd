import { STOCK_STATUS_CFG, StockStatus } from "@/types/inventoryTypes";


export default function StockStatusBadge({ status }: { status: StockStatus }) {
  const c = STOCK_STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium font-sans ${c.color} ${c.bgClass}`}>
      {c.label}
    </span>
  );
}