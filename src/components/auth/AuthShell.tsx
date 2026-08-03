import Link from "next/link";
import { Boxes, Factory, PackageCheck, ReceiptText, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footerText: string;
  footerLink: string;
  footerLabel: string;
}

const highlights = [
  { icon: Boxes, title: "Stock control", text: "Track raw materials and finished products." },
  { icon: Factory, title: "Production flow", text: "Record every conversion and movement." },
  { icon: ReceiptText, title: "Complete ledgers", text: "Keep sales, payments, returns, and dues together." },
];

export default function AuthShell({ eyebrow, title, description, children, footerText, footerLink, footerLabel }: AuthShellProps) {
  return (
    <main className="grid min-h-dvh bg-slate-50 lg:grid-cols-[minmax(380px,0.85fr)_1.15fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />

        <Link href="/" className="relative flex w-fit items-center gap-3" aria-label="StockFlow home">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500 shadow-xl shadow-indigo-950/40">
            <PackageCheck className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-lg font-bold tracking-tight">StockFlow</span>
            <span className="block text-[11px] text-slate-400">Inventory Management</span>
          </span>
        </Link>

        <div className="relative max-w-lg py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-indigo-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            One connected inventory workspace
          </span>
          <h2 className="mt-6 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">Run every stock movement with confidence.</h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">Purchasing, production, finished goods, customer ledgers, and reports stay connected from one transaction history.</p>

          <div className="mt-9 space-y-4">
            {highlights.map((item) => (
              <div key={item.title} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300"><item.icon className="h-5 w-5" /></span>
                <span><span className="block text-sm font-semibold">{item.title}</span><span className="mt-0.5 block text-xs text-slate-400">{item.text}</span></span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-500">Inventory operations, clearly accounted for.</p>
      </section>

      <section className="flex min-h-dvh items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-9 flex w-fit items-center gap-3 lg:hidden" aria-label="StockFlow home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white"><PackageCheck className="h-5 w-5" /></span>
            <span><span className="block font-bold tracking-tight text-slate-950">StockFlow</span><span className="block text-[10px] text-slate-400">Inventory Management</span></span>
          </Link>

          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
          </div>

          {children}

          <p className="mt-7 text-center text-sm text-slate-500">
            {footerText}{" "}
            <Link href={footerLink} className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">{footerLabel}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export const authInputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";
export const authButtonClass = "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60";
