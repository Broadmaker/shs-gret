import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

export function ConfirmModal({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onClose: () => void;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.classList.add("modal-open");
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
      window.addEventListener("keydown", onKey);
      // focus first button after paint
      setTimeout(() => backdropRef.current?.querySelector<HTMLButtonElement>("[data-autofocus]")?.focus(), 30);
      return () => {
        document.body.classList.remove("modal-open");
        window.removeEventListener("keydown", onKey);
      };
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="modal-backdrop show"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="confirm-title" className="modal-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: variant === "danger" ? "var(--red-lt)" : "var(--primary-lt)", color: variant === "danger" ? "var(--red)" : "var(--primary)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={14} />
            </span>
            {title}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
          <p style={{ marginTop: 8, fontSize: 11.5, color: "var(--text-muted)" }}>This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>{cancelLabel}</button>
          <button data-autofocus className={variant === "danger" ? "btn" : "btn btn-primary"} style={variant === "danger" ? { background: "var(--red)", color: "#fff", borderColor: "#a82b2b" } : undefined} onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
