"use client";

import { useState, type FormEvent } from "react";
import { Plus, Search, ShoppingCart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { recordPurchase } from "@/store/slices/inventorySlice";
import { formatCurrency, formatDateTime, nowIso } from "@/lib/inventory";
import Modal, { FormField, inputClass, primaryButtonClass, secondaryButtonClass } from "../Modal";
import PageHeader from "../PageHeader";

export default function PurchaseHistoryTab() {
  const dispatch = useAppDispatch();
  const { purchases, rawMaterials } = useAppSelector((state) => state.inventory);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [materialId, setMaterialId] = useState(rawMaterials[0]?.id ?? 0);
  const selectedMaterial = rawMaterials.find((item) => item.id === materialId);
  const filtered = purchases.filter((purchase) => {
    const material = rawMaterials.find((item) => item.id === purchase.materialId)?.name ?? "";
    return `${purchase.ref} ${purchase.supplier} ${material}`.toLowerCase().includes(search.toLowerCase());
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    dispatch(recordPurchase({ supplier: String(data.get("supplier")), materialId: Number(data.get("materialId")), quantity: Number(data.get("quantity")), unitCost: Number(data.get("unitCost")), date: nowIso() }));
    setShowForm(false);
  };

  return <div className="space-y-5">
    <PageHeader title="Purchases" description="Record raw material purchases; stock and movement history update automatically." action={<button onClick={() => setShowForm(true)} disabled={!rawMaterials.length} className={primaryButtonClass}><Plus className="h-4 w-4" />Record purchase</button>} />
    <div className="grid gap-4 sm:grid-cols-3"><Metric label="Purchase records" value={purchases.length.toString()} /><Metric label="Total purchase value" value={formatCurrency(purchases.reduce((sum, item) => sum + item.total, 0))} /><Metric label="Raw stock received" value={purchases.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()} /></div>
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h2 className="font-bold text-slate-900">Purchase history</h2><p className="text-xs text-slate-500">Every record creates a raw-material Stock IN movement.</p></div><div className="relative w-full sm:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search purchases" className={`${inputClass} pl-9`} /></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Reference</th><th className="px-5 py-3 font-semibold">Supplier</th><th className="px-5 py-3 font-semibold">Raw material</th><th className="px-5 py-3 font-semibold">Quantity</th><th className="px-5 py-3 font-semibold">Total</th><th className="px-5 py-3 font-semibold">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((purchase) => { const material = rawMaterials.find((item) => item.id === purchase.materialId); return <tr key={purchase.id} className="text-sm hover:bg-slate-50/60"><td className="px-5 py-4 font-semibold text-indigo-600">{purchase.ref}</td><td className="px-5 py-4 text-slate-700">{purchase.supplier}</td><td className="px-5 py-4 text-slate-700">{material?.name ?? "Unknown"}</td><td className="px-5 py-4 text-slate-700">{purchase.quantity.toLocaleString()} {material?.unit}</td><td className="px-5 py-4 font-semibold text-slate-900">{formatCurrency(purchase.total)}</td><td className="px-5 py-4 text-slate-500">{formatDateTime(purchase.date)}</td></tr>; })}</tbody></table></div>
    </section>
    {showForm && <Modal title="Record raw material purchase" description="Saving this purchase increases raw material stock and creates a Stock IN record." onClose={() => setShowForm(false)}><form onSubmit={handleSubmit} className="space-y-4"><FormField label="Supplier"><input name="supplier" required placeholder="Supplier name" className={inputClass} /></FormField><FormField label="Raw material"><select name="materialId" value={materialId} onChange={(event) => setMaterialId(Number(event.target.value))} className={inputClass}>{rawMaterials.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.stock} {item.unit} available)</option>)}</select></FormField><div className="grid gap-4 sm:grid-cols-2"><FormField label={`Quantity (${selectedMaterial?.unit ?? "units"})`}><input name="quantity" required min="0.01" step="0.01" type="number" className={inputClass} /></FormField><FormField label="Unit cost"><input name="unitCost" required min="0" step="0.01" type="number" defaultValue={selectedMaterial?.unitCost} className={inputClass} /></FormField></div><div className="flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className={secondaryButtonClass}>Cancel</button><button className={primaryButtonClass}><ShoppingCart className="h-4 w-4" />Save purchase</button></div></form></Modal>}
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p></div>; }
