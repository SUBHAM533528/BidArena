import React, { useEffect } from "react";
import { Button } from "./UI";

// A centered, on-brand confirmation modal — replaces the native
// window.confirm()/alert() browser dialogs used across admin delete
// actions. Controlled from the parent via a small { open, ... } state
// object (see useConfirm below for the common pattern).
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape" && !loading) onCancel?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-up"
        onClick={() => !loading && onCancel?.()}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[#0d1310] shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 animate-slide-down">
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${danger ? "bg-flame-500/15 border border-flame-500/30" : "bg-jade-500/15 border border-jade-500/30"}`}>
          <i className={`fa-solid ${danger ? "fa-triangle-exclamation text-flame-400" : "fa-circle-check text-jade-400"} text-lg`} />
        </div>
        <h2 className="font-display text-lg font-bold text-white mb-1.5">{title}</h2>
        {message && <p className="text-sm text-ink-400 leading-relaxed mb-6">{message}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button variant={danger ? "danger" : "jade"} size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
