import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef(document.activeElement as HTMLElement | null);
  useEffect(() => {
    const prior = opener.current;
    const dialog = ref.current;
    dialog?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      queueMicrotask(() => { if (!dialog?.isConnected) prior?.focus(); });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onKeyDownCapture={(e) => {
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); }
        if (e.key === "Tab") {
          const focusable = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex="0"]')).filter(el => el.getClientRects().length > 0);
          const first = focusable[0], last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-inner">
        <div className="modal-heading">
          <h2 id="modal-title">{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
