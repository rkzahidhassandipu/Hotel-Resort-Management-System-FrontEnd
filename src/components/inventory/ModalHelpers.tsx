import { X, Loader2 } from 'lucide-react';

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1A1B21] border border-white/8 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-display text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-white/40 text-xs font-sans mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

export function ModalFooter({ onClose, onSave, saving, label }: { onClose: () => void; onSave: () => void; saving: boolean; label: string }) {
  return (
    <div className="flex gap-2 mt-5 justify-end">
      <button onClick={onClose} className="px-4 py-2 text-sm font-sans text-white/50 hover:text-white border border-white/10 rounded-lg transition-all">Cancel</button>
      <button onClick={onSave} disabled={saving}
        className="px-4 py-2 text-sm font-sans font-medium bg-[#C8102E] text-white rounded-lg hover:bg-[#a00d24] disabled:opacity-60 flex items-center gap-2 transition-all">
        {saving ? <Loader2 size={14} className="animate-spin" /> : null}
        {saving ? 'Saving…' : label}
      </button>
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-1">
      <span className="text-white/30 text-xs font-sans min-w-[90px]">{label}</span>
      <span className="text-white/80 text-sm font-sans">{value}</span>
    </div>
  );
}