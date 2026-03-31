'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface AppFieldProps {
  label: string; id: string; error?: string; required?: boolean;
  children: React.ReactElement<{ id: string; className?: string }>;
}
export default function AppField({ label, id, error, required, children }: AppFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-white/50 text-[10px] font-sans uppercase tracking-widest">
        {label}{required && <span className="text-[#C8102E] ml-0.5">*</span>}
      </label>
      {React.cloneElement(children, {
        id,
        className: cn(
          'w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20',
          error && 'border-[#C8102E]/50 focus:border-[#C8102E]/60',
          children.props.className,
        ),
      })}
      {error && <p className="text-[#C8102E] text-xs font-sans">{error}</p>}
    </div>
  );
}
