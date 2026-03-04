/**
 * Modal 组件 — 使用 HTML dialog 元素
 */

import { useEffect, useRef, type ReactNode } from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="rounded-12 p-0 backdrop:bg-black/50 max-w-512px w-full"
      onClose={onClose}
    >
      <div className="p-6">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-18 font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-20 leading-none"
            >
              &times;
            </button>
          </div>
        )}
        {children}
      </div>
    </dialog>
  );
}
