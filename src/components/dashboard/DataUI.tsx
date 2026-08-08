"use client";

import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import Modal, { primaryButtonClass, secondaryButtonClass } from "./Modal";
import { useInventoryBusy } from "@/store/hooks";

export function ConfirmDialog({
  title = "Delete record?",
  description,
  onCancel,
  onConfirm,
}: {
  title?: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const loading = useInventoryBusy();
  return (
    <Modal title={title} description={description} onClose={onCancel}>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={onCancel}
          className={secondaryButtonClass}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={loading}
          aria-busy={loading}
          onClick={onConfirm}
          className={`${primaryButtonClass} bg-rose-600 hover:bg-rose-700`}
        >
          {loading ? <ButtonSpinner /> : <Trash2 className="h-4 w-4" />}
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
}

export function ButtonSpinner() {
  return <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />;
}

export function EmptyState({
  title = "No records found",
  description = "Try changing your search or add a new record.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="py-14 text-center">
      <Inbox className="mx-auto h-9 w-9 text-slate-300" />
      <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}

export function Pagination({
  page,
  pages,
  total,
  onChange,
}: {
  page: number;
  pages: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (!total) return null;
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <span>
        {total} record{total === 1 ? "" : "s"} · Page {page} of {pages}
      </span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div
      className="min-h-screen bg-slate-100 p-6 lg:pl-[280px]"
      aria-label="Loading inventory"
    >
      <div className="mx-auto max-w-7xl animate-pulse space-y-5">
        <div className="h-16 rounded-2xl bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-28 rounded-2xl bg-slate-200" />
          <div className="h-28 rounded-2xl bg-slate-200" />
          <div className="h-28 rounded-2xl bg-slate-200" />
        </div>
        <div className="h-96 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

export const iconButtonClass =
  "rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40";
