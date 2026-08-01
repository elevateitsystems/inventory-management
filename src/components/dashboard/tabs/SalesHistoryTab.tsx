"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Plus, Search, ShoppingBag } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { recordSale } from "@/store/slices/inventorySlice";
import { formatCurrency, formatDateTime, nowIso } from "@/lib/inventory";
import Modal, { FormField, inputClass, primaryButtonClass, secondaryButtonClass } from "../Modal";
import PageHeader from "../PageHeader";

export default function SalesHistoryTab() {
  const dispatch = useAppDispatch();
  const { sales, customers, finishedProducts } = useAppSelector((state) => state.inventory);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [productId, setProductId] = useState(finishedProducts[0]?.id ?? 0);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(finishedProducts[0]?.salePrice ?? 0);
  const selectedProduct = finishedProducts.find((item) => item.id === productId);
  const saleTotal = useMemo(() => quantity * unitPrice, [quantity, unitPrice]);
  const filtered = sales.filter((sale) => {
    const customer = customers.find((item) => item.id === sale.customerId)?.name ?? "";
    const product = finishedProducts.find((item) => item.id === sale.productId)?.name ?? "";
    return `${sale.ref} ${customer} ${product}`.toLowerCase().includes(search.toLowerCase());
  });

  const selectProduct = (id: number) => {
    setProductId(id);
    setUnitPrice(finishedProducts.find((item) => item.id === id)?.salePrice ?? 0);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payment = Math.min(Number(data.get("payment")), saleTotal);
    if (!selectedProduct || quantity > selectedProduct.stock) return;
    dispatch(recordSale({ customerId: Number(data.get("customerId")), productId, quantity, unitPrice, payment, date: nowIso() }));
    setShowForm(false);
  };

  return <div className="space-y-5">
    <PageHeader title="Sales" description="Record customer sales and automatically update finished stock and the customer ledger." action={<button onClick={() => setShowForm(true)} disabled={!customers.length || !finishedProducts.length} className={primaryButtonClass}><Plus className="h-4 w-4" />New sale</button>} />
    <div className="grid gap-4 sm:grid-cols-3"><Metric label="Sales invoices" value={sales.length.toString()} /><Metric label="Total sales" value={formatCurrency(sales.reduce((sum, item) => sum + item.total, 0))} /><Metric label="Units sold" value={sales.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()} /></div>
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h2 className="font-bold text-slate-900">Sales history</h2><p className="text-xs text-slate-500">Each invoice creates finished-product Stock OUT and a ledger debit.</p></div><div className="relative w-full sm:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sales" className={`${inputClass} pl-9`} /></div></div><div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left"><thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Invoice</th><th className="px-5 py-3 font-semibold">Customer</th><th className="px-5 py-3 font-semibold">Product</th><th className="px-5 py-3 font-semibold">Quantity</th><th className="px-5 py-3 font-semibold">Total</th><th className="px-5 py-3 font-semibold">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((sale) => { const customer = customers.find((item) => item.id === sale.customerId); const product = finishedProducts.find((item) => item.id === sale.productId); return <tr key={sale.id} className="text-sm hover:bg-slate-50/60"><td className="px-5 py-4 font-semibold text-indigo-600">{sale.ref}</td><td className="px-5 py-4 font-medium text-slate-800">{customer?.name}</td><td className="px-5 py-4 text-slate-700">{product?.name}</td><td className="px-5 py-4 text-slate-700">{sale.quantity} {product?.unit}</td><td className="px-5 py-4 font-semibold text-slate-900">{formatCurrency(sale.total)}</td><td className="px-5 py-4 text-slate-500">{formatDateTime(sale.date)}</td></tr>; })}</tbody></table></div></section>
    {showForm && <Modal title="Record product sale" description="The invoice reduces finished stock and opens a customer ledger entry." onClose={() => setShowForm(false)}><form onSubmit={handleSubmit} className="space-y-4"><FormField label="Customer"><select name="customerId" className={inputClass}>{customers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField><FormField label="Finished product"><select name="productId" value={productId} onChange={(event) => selectProduct(Number(event.target.value))} className={inputClass}>{finishedProducts.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.stock} {item.unit} available</option>)}</select></FormField><div className="grid gap-4 sm:grid-cols-2"><FormField label={`Quantity (${selectedProduct?.unit ?? "units"})`} hint={`Maximum available: ${selectedProduct?.stock ?? 0}`}><input name="quantity" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} required min="0.01" max={selectedProduct?.stock} step="0.01" type="number" className={inputClass} /></FormField><FormField label="Unit price"><input name="unitPrice" value={unitPrice} onChange={(event) => setUnitPrice(Number(event.target.value))} required min="0" step="0.01" type="number" className={inputClass} /></FormField></div><FormField label="Payment received now" hint={`Invoice total: ${formatCurrency(saleTotal)}. Enter 0 for credit, part of the total for partial, or the full total.`}><input name="payment" defaultValue="0" min="0" max={saleTotal} step="0.01" type="number" className={inputClass} /></FormField><div className="rounded-xl bg-slate-50 px-4 py-3"><div className="flex justify-between text-sm"><span className="text-slate-500">Invoice total</span><strong className="text-slate-900">{formatCurrency(saleTotal)}</strong></div></div><div className="flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className={secondaryButtonClass}>Cancel</button><button className={primaryButtonClass}><ShoppingBag className="h-4 w-4" />Complete sale</button></div></form></Modal>}
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p></div>; }
