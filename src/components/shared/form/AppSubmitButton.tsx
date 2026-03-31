'use client';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
interface Props {
  children: React.ReactNode; loading?: boolean; disabled?: boolean;
  variant?: 'primary' | 'danger' | 'outline'; className?: string;
}
const variants = {
  primary: 'bg-[#C8102E] hover:bg-[#a00d24] text-white shadow-lg hover:shadow-[#C8102E]/25',
  danger:  'bg-[#C8102E]/80 hover:bg-[#C8102E] text-white',
  outline: 'border border-white/10 hover:border-white/25 text-white hover:bg-white/5',
};
export default function AppSubmitButton({ children, loading, disabled, variant = 'primary', className }: Props) {
  return (
    <button type="submit" disabled={loading || disabled}
      className={cn('flex items-center justify-center gap-2 font-sans font-medium text-sm py-2.5 px-5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed', variants[variant], className)}>
      {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Processing...</> : children}
    </button>
  );
}
