"use client";

import { useState, type FormEvent } from "react";
import { Factory, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { recordProduction } from "@/store/slices/inventorySlice";
import { formatDateTime, nowIso } from "@/lib/inventory";
import Modal, { FormField, inputClass, primaryButtonClass, secondaryButtonClass } from "../Modal";
import PageHeader from "../PageHeader";

export default function ProductionTab() {
  const dispatch = useAppDispatch();
  const { productions, rawMaterials, finishedProducts } = useAppSelector((state) => state.inventory);
  const [showForm, setShowForm] = useState(false);
  const [materialId, setMaterialId] = useState(rawMaterials[0]?.id ?? 0);
  const selectedMaterial = rawMaterials.find((item) => item.id === materialId);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const materialQuantity = Number(data.get("materialQuantity"));
    if (!selectedMaterial || materialQuantity > selectedMaterial.stock) return;
    dispatch(recordProduction({ materialId: Number(data.get("materialId")), materialQuantity, productId: Number(data.get("productId")), productQuantity: Number(data.get("productQuantity")), date: nowIso() }));
    setShowForm(false);
  };

  return <div className="space-y-5">
    <PageHeader title="Production" description="Convert raw materials into finished products with linked stock movements." action={<button onClick={() => setShowForm(true)} disabled={!rawMaterials.length || !finishedProducts.length} className={primaryButtonClass}><Plus className="h-4 w-4" />Record production</button>} />
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800"><div className="flex gap-3"><Factory className="mt-0.5 h-5 w-5 shrink-0" /><p>A production record creates two movements: raw material <strong>Stock OUT</strong> and finished product <strong>Stock IN</strong>.</p></div></div>
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="font-bold text-slate-900">Production history</h2><p className="text-xs text-slate-500">{productions.length} completed production batches</p></div><div className="overflow-x-auto"><table className="w-full min-w-[840px] text-left"><thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Batch</th><th className="px-5 py-3 font-semibold">Raw material used</th><th className="px-5 py-3 font-semibold">Finished product</th><th className="px-5 py-3 font-semibold">Output</th><th className="px-5 py-3 font-semibold">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{productions.map((batch) => { const material = rawMaterials.find((item) => item.id === batch.materialId); const product = finishedProducts.find((item) => item.id === batch.productId); return <tr key={batch.id} className="text-sm hover:bg-slate-50/60"><td className="px-5 py-4 font-semibold text-indigo-600">{batch.ref}</td><td className="px-5 py-4"><p className="font-medium text-slate-800">{material?.name}</p><p className="text-xs text-rose-600">-{batch.materialQuantity} {material?.unit}</p></td><td className="px-5 py-4 font-medium text-slate-800">{product?.name}</td><td className="px-5 py-4 font-semibold text-emerald-600">+{batch.productQuantity} {product?.unit}</td><td className="px-5 py-4 text-slate-500">{formatDateTime(batch.date)}</td></tr>; })}</tbody></table></div></section>
    {showForm && <Modal title="Record production" description="Choose the consumed raw material and the finished product created." onClose={() => setShowForm(false)}><form onSubmit={handleSubmit} className="space-y-4"><FormField label="Raw material"><select name="materialId" value={materialId} onChange={(event) => setMaterialId(Number(event.target.value))} className={inputClass}>{rawMaterials.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.stock} {item.unit} available</option>)}</select></FormField><FormField label={`Quantity consumed (${selectedMaterial?.unit ?? "units"})`} hint={`Maximum available: ${selectedMaterial?.stock ?? 0}`}><input name="materialQuantity" required min="0.01" max={selectedMaterial?.stock} step="0.01" type="number" className={inputClass} /></FormField><FormField label="Finished product"><select name="productId" className={inputClass}>{finishedProducts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField><FormField label="Quantity produced"><input name="productQuantity" required min="0.01" step="0.01" type="number" className={inputClass} /></FormField><div className="flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className={secondaryButtonClass}>Cancel</button><button className={primaryButtonClass}><Factory className="h-4 w-4" />Complete production</button></div></form></Modal>}
  </div>;
}
