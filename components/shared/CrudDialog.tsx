"use client";

import { FormEvent, MouseEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export type CrudField = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "date" | "select" | "textarea";
  required?: boolean;
  step?: string;
  options?: { label: string; value: string }[];
  placeholder?: string;
};

type CrudDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  fields: CrudField[];
  submitLabel: string;
  accent: string;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
};

export function CrudDialog({ open, title, description, fields, submitLabel, accent, onClose, onSubmit }: CrudDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !mounted) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted, onClose, open]);

  if (!open || !mounted) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit(Object.fromEntries(formData.entries()) as Record<string, string>);
    event.currentTarget.reset();
  }

  function handleBackdropClick() {
    onClose();
  }

  function handlePanelClick(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/50 px-4 py-8" onClick={handleBackdropClick}>
      <div className="flex min-h-full items-center justify-center">
        <div className="relative flex max-h-[calc(100vh-4rem)] w-full max-w-xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl" onClick={handlePanelClick} role="dialog" aria-modal="true" aria-label={title}>
          <div className="shrink-0 flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
              {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
            </div>
            <button type="button" className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-950" onClick={onClose} aria-label="Close dialog">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((field) => (
                  <label key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : undefined}>
                    <span className="text-sm font-medium text-slate-700">{field.label}</span>
                    {field.type === "select" ? (
                      <select name={field.name} required={field.required} className="mt-1 h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200">
                        {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea name={field.name} required={field.required} placeholder={field.placeholder} className="mt-1 min-h-24 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" />
                    ) : (
                      <input name={field.name} type={field.type ?? "text"} required={field.required} step={field.step} placeholder={field.placeholder} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" />
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4">
              <button type="button" className="rounded border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={onClose}>Cancel</button>
              <button type="submit" className="rounded px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>{submitLabel}</button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}