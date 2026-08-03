"use client";

import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, CalendarDays, ClipboardList, Download } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { formatCurrency, formatDateTime, getDateKey, getMonthKey } from "@/lib/inventory";
import { inputClass, secondaryButtonClass } from "../Modal";
import PageHeader from "../PageHeader";
import { useToast } from "@/components/ui/ToastProvider";

const today = new Date().toISOString().slice(0, 10);

export default function ReportsTab() {
  const inventory = useAppSelector((state) => state.inventory);
  const toast = useToast();
  const [reportDate, setReportDate] = useState(today);
  const [reportMonth, setReportMonth] = useState(today.slice(0, 7));
  const dailyTransactions = inventory.transactions.filter((item) => getDateKey(item.date) === reportDate);
  const dailyMovements = inventory.stockMovements.filter((item) => getDateKey(item.date) === reportDate);
  const monthlyTransactions = inventory.transactions.filter((item) => getMonthKey(item.date) === reportMonth);
  const monthlySales = monthlyTransactions.filter((item) => item.type === "Sale").reduce((sum, item) => sum + item.amount, 0);
  const monthlyPurchases = monthlyTransactions.filter((item) => item.type === "Purchase").reduce((sum, item) => sum + item.amount, 0);
  const monthlyPayments = monthlyTransactions.filter((item) => item.type === "Payment").reduce((sum, item) => sum + item.amount, 0);
  const monthlyReturns = monthlyTransactions.filter((item) => item.type === "Return").reduce((sum, item) => sum + item.amount, 0);
  const inventoryRows = [
    ...inventory.rawMaterials.map((item) => ({ ...item, kind: "Raw material" as const })),
    ...inventory.finishedProducts.map((item) => ({ ...item, kind: "Finished product" as const })),
  ].map((item) => {
    const stockType = item.kind === "Raw material" ? "raw" : "finished";
    const movements = inventory.stockMovements.filter((movement) => movement.stockType === stockType && movement.itemId === item.id);
    return { ...item, stockIn: movements.filter((movement) => movement.type === "IN").reduce((sum, movement) => sum + movement.quantity, 0), stockOut: movements.filter((movement) => movement.type === "OUT").reduce((sum, movement) => sum + movement.quantity, 0) };
  });
  const exportCsv = () => {
    const rows = inventoryRows.map((item) => [item.sku, item.name, item.kind, item.openingStock, item.stockIn, item.stockOut, item.stock, item.unit]);
    const csv = [["SKU", "Item", "Category", "Opening", "Stock IN", "Stock OUT", "Closing", "Unit"], ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `inventory-report-${today}.csv`; link.click(); URL.revokeObjectURL(url); toast("Inventory report downloaded.");
  };

  return <div className="space-y-5">
    <PageHeader title="Reports" description="Daily transactions, stock movements, monthly summaries, and inventory balances." action={<button onClick={exportCsv} className={secondaryButtonClass}><Download className="h-4 w-4" />Export inventory CSV</button>} />
    <div className="grid gap-5 xl:grid-cols-2">
      <ReportCard title="Daily Transactions" subtitle="All purchase, production, sale, payment, and return activity." icon={<CalendarDays className="h-5 w-5" />} control={<input type="date" value={reportDate} onChange={(event) => setReportDate(event.target.value)} className={`${inputClass} w-auto py-2`} />}>
        <div className="mb-4 grid grid-cols-3 gap-3"><MiniMetric label="Entries" value={dailyTransactions.length.toString()} /><MiniMetric label="Sales" value={formatCurrency(dailyTransactions.filter((item) => item.type === "Sale").reduce((sum, item) => sum + item.amount, 0))} /><MiniMetric label="Payments" value={formatCurrency(dailyTransactions.filter((item) => item.type === "Payment").reduce((sum, item) => sum + item.amount, 0))} /></div>
        <div className="max-h-72 overflow-auto rounded-xl border border-slate-100"><table className="w-full min-w-[560px] text-left text-sm"><thead className="sticky top-0 bg-slate-50 text-xs text-slate-500"><tr><th className="px-3 py-2.5">Type</th><th className="px-3 py-2.5">Reference</th><th className="px-3 py-2.5">Party / item</th><th className="px-3 py-2.5 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{dailyTransactions.map((item) => <tr key={item.id}><td className="px-3 py-3 font-medium text-slate-800">{item.type}</td><td className="px-3 py-3 text-indigo-600">{item.ref}</td><td className="px-3 py-3 text-slate-600">{item.party}</td><td className="px-3 py-3 text-right font-medium">{item.amount ? formatCurrency(item.amount) : "—"}</td></tr>)}{!dailyTransactions.length && <tr><td colSpan={4} className="px-3 py-10 text-center text-slate-400">No transactions for this date.</td></tr>}</tbody></table></div>
      </ReportCard>
      <ReportCard title="Daily Stock Movement" subtitle="Raw material and finished product movement history." icon={<ArrowUpFromLine className="h-5 w-5" />} control={<input type="date" value={reportDate} onChange={(event) => setReportDate(event.target.value)} className={`${inputClass} w-auto py-2`} />}>
        <div className="mb-4 grid grid-cols-3 gap-3"><MiniMetric label="Movements" value={dailyMovements.length.toString()} /><MiniMetric label="Stock IN" value={dailyMovements.filter((item) => item.type === "IN").reduce((sum, item) => sum + item.quantity, 0).toLocaleString()} /><MiniMetric label="Stock OUT" value={dailyMovements.filter((item) => item.type === "OUT").reduce((sum, item) => sum + item.quantity, 0).toLocaleString()} /></div>
        <div className="max-h-72 overflow-auto rounded-xl border border-slate-100"><table className="w-full min-w-[560px] text-left text-sm"><thead className="sticky top-0 bg-slate-50 text-xs text-slate-500"><tr><th className="px-3 py-2.5">Item</th><th className="px-3 py-2.5">Movement</th><th className="px-3 py-2.5">Reason</th><th className="px-3 py-2.5 text-right">Quantity</th></tr></thead><tbody className="divide-y divide-slate-100">{dailyMovements.map((item) => <tr key={item.id}><td className="px-3 py-3"><p className="font-medium text-slate-800">{item.itemName}</p><p className="text-xs capitalize text-slate-400">{item.stockType}</p></td><td className="px-3 py-3"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${item.type === "IN" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{item.type === "IN" ? <ArrowDownToLine className="h-3 w-3" /> : <ArrowUpFromLine className="h-3 w-3" />}{item.type}</span></td><td className="px-3 py-3 text-slate-600">{item.reason}</td><td className="px-3 py-3 text-right font-semibold">{item.quantity.toLocaleString()}</td></tr>)}{!dailyMovements.length && <tr><td colSpan={4} className="px-3 py-10 text-center text-slate-400">No stock movements for this date.</td></tr>}</tbody></table></div>
      </ReportCard>
    </div>
    <ReportCard title="Monthly Report" subtitle="Calculated from the complete transaction history for the selected month." icon={<ClipboardList className="h-5 w-5" />} control={<input type="month" value={reportMonth} onChange={(event) => setReportMonth(event.target.value)} className={`${inputClass} w-auto py-2`} />}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><MonthlyMetric label="Sales" value={formatCurrency(monthlySales)} color="text-indigo-600" /><MonthlyMetric label="Purchases" value={formatCurrency(monthlyPurchases)} /><MonthlyMetric label="Payments received" value={formatCurrency(monthlyPayments)} color="text-emerald-600" /><MonthlyMetric label="Returns" value={formatCurrency(monthlyReturns)} color="text-amber-600" /><MonthlyMetric label="Transactions" value={monthlyTransactions.length.toString()} /></div>
    </ReportCard>
    <ReportCard title="Inventory Report" subtitle="Opening balance, total Stock IN, total Stock OUT, and current closing balance." icon={<ClipboardList className="h-5 w-5" />}>
      <div className="overflow-x-auto rounded-xl border border-slate-100"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Item</th><th className="px-4 py-3">Category</th><th className="px-4 py-3 text-right">Opening balance</th><th className="px-4 py-3 text-right">Stock IN</th><th className="px-4 py-3 text-right">Stock OUT</th><th className="px-4 py-3 text-right">Closing balance</th></tr></thead><tbody className="divide-y divide-slate-100">{inventoryRows.map((item) => <tr key={`${item.kind}-${item.id}`}><td className="px-4 py-3"><p className="font-semibold text-slate-800">{item.name}</p><p className="text-xs text-slate-400">{item.sku}</p></td><td className="px-4 py-3 text-slate-600">{item.kind}</td><td className="px-4 py-3 text-right text-slate-600">{item.openingStock.toLocaleString()} {item.unit}</td><td className="px-4 py-3 text-right font-medium text-emerald-600">+{item.stockIn.toLocaleString()}</td><td className="px-4 py-3 text-right font-medium text-rose-600">-{item.stockOut.toLocaleString()}</td><td className="px-4 py-3 text-right font-bold text-slate-900">{item.stock.toLocaleString()} {item.unit}</td></tr>)}</tbody></table></div>
    </ReportCard>
    <p className="text-center text-xs text-slate-400">Reports are calculated from saved transaction and stock movement history. Last viewed {formatDateTime(new Date().toISOString())}.</p>
  </div>;
}

function ReportCard({ title, subtitle, icon, control, children }: { title: string; subtitle: string; icon: React.ReactNode; control?: React.ReactNode; children: React.ReactNode }) { return <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="flex min-w-0 items-center gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">{icon}</div><div className="min-w-0"><h2 className="font-bold text-slate-900">{title}</h2><p className="text-xs text-slate-500">{subtitle}</p></div></div>{control && <div className="w-full sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">{control}</div>}</div>{children}</section>; }
function MiniMetric({ label, value }: { label: string; value: string }) { return <div className="min-w-0 rounded-xl bg-slate-50 p-2.5 sm:p-3"><p className="truncate text-[11px] text-slate-500 sm:text-xs">{label}</p><p className="mt-1 break-words text-xs font-bold text-slate-900 sm:text-sm">{value}</p></div>; }
function MonthlyMetric({ label, value, color = "text-slate-900" }: { label: string; value: string; color?: string }) { return <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 p-4"><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 break-words text-lg font-bold sm:text-xl ${color}`}>{value}</p></div>; }
