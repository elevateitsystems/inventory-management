"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

type ToastKind = "success" | "error";
type Toast = { id: number; message: string; kind: ToastKind };
const ToastContext = createContext<(message: string, kind?: ToastKind) => void>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setToasts((items) => [...items, { id, message, kind }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3500);
  }, []);
  return <ToastContext.Provider value={showToast}>
    {children}
    <div className="fixed right-4 top-4 z-[80] flex w-[min(92vw,380px)] flex-col gap-2" aria-live="polite">
      {toasts.map((toast) => <div key={toast.id} role={toast.kind === "error" ? "alert" : "status"} className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-xl ${toast.kind === "error" ? "border-rose-200" : "border-emerald-200"}`}>
        {toast.kind === "error" ? <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />}
        <p className="flex-1 text-sm font-medium text-slate-700">{toast.message}</p>
        <button onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))} aria-label="Dismiss notification" className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
      </div>)}
    </div>
  </ToastContext.Provider>;
}

export const useToast = () => useContext(ToastContext);
