import type { ReactNode } from "react";

export default function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action && (
        <div className="w-full shrink-0 sm:w-auto [&>button]:w-full sm:[&>button]:w-auto [&>div]:flex [&>div]:w-full [&>div]:flex-wrap [&>div>button]:min-w-0 [&>div>button]:flex-1 sm:[&>div]:w-auto sm:[&>div>button]:flex-none">
          {action}
        </div>
      )}
    </div>
  );
}
