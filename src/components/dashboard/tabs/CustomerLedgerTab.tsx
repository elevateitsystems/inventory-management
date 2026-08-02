"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Banknote, RotateCcw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { recordPayment, recordReturn } from "@/store/slices/inventorySlice";
import { formatCurrency, formatDateTime, getCustomerDue, nowIso } from "@/lib/inventory";
import Modal, { FormField, inputClass, primaryButtonClass, secondaryButtonClass } from "../Modal";
import PageHeader from "../PageHeader";

export default function CustomerLedgerTab() {
  const dispatch = useAppDispatch();
  const { customers, ledger, finishedProducts } = useAppSelector((state) => state.inventory);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id ?? 0);
  const [dialog, setDialog] = useState<"payment" | "return" | null>(null);
  const [returnProductId, setReturnProductId] = useState(finishedProducts[0]?.id ?? 0);
  const selectedReturnProduct = finishedProducts.find((item) => item.id === returnProductId);
  const customerEntries = useMemo(() => ledger.filter((entry) => entry.customerId === selectedCustomerId).sort((a, b) => b.date.localeCompare(a.date)), [ledger, selectedCustomerId]);
  const totalDue = customers.reduce((sum, customer) => sum + Math.max(0, getCustomerDue(ledger, customer.id)), 0);

  const handlePayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    dispatch(recordPayment({ customerId: selectedCustomerId, amount: Number(data.get("amount")), date: nowIso() }));
    setDialog(null);
  };
  const handleReturn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    dispatch(recordReturn({ customerId: selectedCustomerId, productId: returnProductId, quantity: Number(data.get("quantity")), unitPrice: Number(data.get("unitPrice")), date: nowIso() }));
    setDialog(null);
  };

  return <div className="space-y-5">
    <PageHeader title="Customer Ledger" description="Sales, payments, returns, and outstanding dues in one complete history." action={<div className="flex gap-2"><button onClick={() => setDialog("return")} className={secondaryButtonClass}><RotateCcw className="h-4 w-4" />Product return</button><button onClick={() => setDialog("payment")} className={primaryButtonClass}><Banknote className="h-4 w-4" />Record payment</button></div>} />
    <div className="grid gap-4 sm:grid-cols-3"><Metric label="Customers" value={customers.length.toString()} /><Metric label="Outstanding dues" value={formatCurrency(totalDue)} danger /><Metric label="Ledger entries" value={ledger.length.toString()} /></div>
    <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm"><h2 className="px-3 pb-3 pt-2 text-sm font-bold text-slate-900">Customer balances</h2><div className="space-y-1">{customers.map((customer) => { const due = getCustomerDue(ledger, customer.id); return <button key={customer.id} onClick={() => setSelectedCustomerId(customer.id)} className={`w-full rounded-xl px-3 py-3 text-left transition ${selectedCustomerId === customer.id ? "bg-indigo-50 ring-1 ring-indigo-100" : "hover:bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><div><p className={`text-sm font-semibold ${selectedCustomerId === customer.id ? "text-indigo-700" : "text-slate-800"}`}>{customer.name}</p><p className="text-xs text-slate-400">{customer.phone}</p></div><p className={`text-sm font-bold ${due > 0 ? "text-rose-600" : "text-emerald-600"}`}>{formatCurrency(due)}</p></div></button>; })}</div></section>
      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-bold text-slate-900">Transaction history</h2><p className="text-xs text-slate-500">Running due is debit minus credit.</p></div><div className="text-right"><p className="text-xs text-slate-500">Current due</p><p className="text-lg font-bold text-rose-600">{formatCurrency(getCustomerDue(ledger, selectedCustomerId))}</p></div></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Date</th><th className="px-5 py-3 font-semibold">Type</th><th className="px-5 py-3 font-semibold">Reference</th><th className="px-5 py-3 font-semibold">Details</th><th className="px-5 py-3 text-right font-semibold">Debit</th><th className="px-5 py-3 text-right font-semibold">Credit</th></tr></thead><tbody className="divide-y divide-slate-100">{customerEntries.map((entry) => <tr key={entry.id} className="text-sm hover:bg-slate-50/60"><td className="px-5 py-4 text-slate-500">{formatDateTime(entry.date)}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${entry.type === "Sale" ? "bg-indigo-100 text-indigo-700" : entry.type === "Payment" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{entry.type}</span></td><td className="px-5 py-4 font-medium text-slate-800">{entry.ref}</td><td className="px-5 py-4 text-slate-600">{entry.note}</td><td className="px-5 py-4 text-right font-medium text-slate-900">{entry.debit ? formatCurrency(entry.debit) : "—"}</td><td className="px-5 py-4 text-right font-medium text-emerald-600">{entry.credit ? formatCurrency(entry.credit) : "—"}</td></tr>)}</tbody></table></div></section>
    </div>
    {dialog === "payment" && <Modal title="Record customer payment" description="Payments reduce the selected customer's outstanding due and appear in daily transactions." onClose={() => setDialog(null)}><form onSubmit={handlePayment} className="space-y-4"><FormField label="Customer"><select value={selectedCustomerId} onChange={(event) => setSelectedCustomerId(Number(event.target.value))} className={inputClass}>{customers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField><div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">Current due: <strong>{formatCurrency(getCustomerDue(ledger, selectedCustomerId))}</strong></div><FormField label="Payment amount"><input name="amount" required min="0.01" max={Math.max(0.01, getCustomerDue(ledger, selectedCustomerId))} step="0.01" type="number" className={inputClass} /></FormField><div className="flex justify-end gap-3"><button type="button" onClick={() => setDialog(null)} className={secondaryButtonClass}>Cancel</button><button className={primaryButtonClass}><Banknote className="h-4 w-4" />Save payment</button></div></form></Modal>}
    {dialog === "return" && <Modal title="Record product return" description="Returns increase finished stock and add a credit to the customer's ledger." onClose={() => setDialog(null)}><form onSubmit={handleReturn} className="space-y-4"><FormField label="Customer"><select value={selectedCustomerId} onChange={(event) => setSelectedCustomerId(Number(event.target.value))} className={inputClass}>{customers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField><FormField label="Returned product"><select value={returnProductId} onChange={(event) => setReturnProductId(Number(event.target.value))} className={inputClass}>{finishedProducts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField><div className="grid gap-4 sm:grid-cols-2"><FormField label={`Quantity (${selectedReturnProduct?.unit ?? "units"})`}><input name="quantity" required min="0.01" step="0.01" type="number" className={inputClass} /></FormField><FormField label="Credit per unit"><input key={returnProductId} name="unitPrice" required defaultValue={selectedReturnProduct?.salePrice} min="0" step="0.01" type="number" className={inputClass} /></FormField></div><div className="flex justify-end gap-3"><button type="button" onClick={() => setDialog(null)} className={secondaryButtonClass}>Cancel</button><button className={primaryButtonClass}><RotateCcw className="h-4 w-4" />Save return</button></div></form></Modal>}
  </div>;
}

function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) { return <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-rose-600" : "text-slate-900"}`}>{value}</p></div>; }
