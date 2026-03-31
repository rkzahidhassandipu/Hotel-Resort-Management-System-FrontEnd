import { format } from 'date-fns';
interface Props { date: string | Date; formatStr?: string; showTime?: boolean; }
export default function DateCell({ date, formatStr, showTime = false }: Props) {
  const d = new Date(date);
  const fmt = formatStr || (showTime ? 'dd MMM yyyy, HH:mm' : 'dd MMM yyyy');
  return (
    <div>
      <p className="text-white text-sm font-sans">{format(d, fmt)}</p>
      {showTime && <p className="text-white/40 text-xs font-sans">{format(d, 'EEEE')}</p>}
    </div>
  );
}
