import { useState } from 'react';
export type ModalAction = 'view' | 'edit' | 'delete' | null;
export function useRowActionModalState<T>() {
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const [action, setAction] = useState<ModalAction>(null);
  const open = (row: T, act: ModalAction) => { setSelectedRow(row); setAction(act); };
  const close = () => { setSelectedRow(null); setAction(null); };
  return { selectedRow, action, open, close, isOpen: action !== null };
}
