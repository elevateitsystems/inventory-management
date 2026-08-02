"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle, Boxes, Plus, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addFinishedProduct } from "@/store/slices/inventorySlice";
import { formatCurrency } from "@/lib/inventory";
import Modal, { FormField, inputClass, primaryButtonClass, secondaryButtonClass } from "../Modal";
import PageHeader from "../PageHeader";

export default function ProductsTab() {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.inventory.finishedProducts);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const filtered = products.filter((item) => `${item.name} ${item.sku}`.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    dispatch(addFinishedProduct({ name: String(data.get("name")), sku: String(data.get("sku")), unit: String(data.get("unit")), stock: Number(data.get("stock")), reorderLevel: Number(data.get("reorderLevel")), salePrice: Number(data.get("salePrice")) }));
    setShowForm(false);
  };

  return <div className="space-y-5">
    <PageHeader title="Finished Products" description="Manage saleable products and current finished-goods stock." action={<button onClick={() => setShowForm(true)} className={primaryButtonClass}><Plus className="h-4 w-4" />Add product</button>} />
    <div className="grid gap-4 sm:grid-cols-3">
      <Summary label="Product types" value={products.length.toString()} icon={<Boxes className="h-5 w-5" />} />
      <Summary label="Finished stock" value={products.reduce((sum, item) => sum + item.stock, 0).toLocaleString()} icon={<Boxes className="h-5 w-5" />} />
      <Summary label="Below reorder level" value={products.filter((item) => item.stock <= item.reorderLevel).length.toString()} icon={<AlertTriangle className="h-5 w-5" />} warning />
    </div>
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4 sm:p-5"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product or SKU" className={`${inputClass} pl-9`} /></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Product</th><th className="px-5 py-3 font-semibold">Unit</th><th className="px-5 py-3 font-semibold">Available stock</th><th className="px-5 py-3 font-semibold">Reorder level</th><th className="px-5 py-3 font-semibold">Sale price</th><th className="px-5 py-3 font-semibold">Status</th></tr></thead>
        <tbody className="divide-y divide-slate-100">{filtered.map((item) => { const low = item.stock <= item.reorderLevel; return <tr key={item.id} className="text-sm hover:bg-slate-50/60"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{item.name}</p><p className="text-xs text-slate-400">{item.sku}</p></td><td className="px-5 py-4 text-slate-600">{item.unit}</td><td className="px-5 py-4 font-semibold text-slate-900">{item.stock.toLocaleString()} {item.unit}</td><td className="px-5 py-4 text-slate-600">{item.reorderLevel.toLocaleString()} {item.unit}</td><td className="px-5 py-4 text-slate-600">{formatCurrency(item.salePrice)}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${low ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{low ? "Low stock" : "In stock"}</span></td></tr>; })}</tbody>
      </table></div>
    </section>
    {showForm && <Modal title="Add finished product" description="Create a saleable product and set its opening stock." onClose={() => setShowForm(false)}><form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2"><FormField label="Product name"><input name="name" required className={inputClass} /></FormField><FormField label="SKU"><input name="sku" required className={inputClass} /></FormField><FormField label="Unit"><select name="unit" className={inputClass}><option>pcs</option><option>packs</option><option>boxes</option><option>kg</option></select></FormField><FormField label="Opening stock"><input name="stock" required min="0" step="0.01" type="number" className={inputClass} /></FormField><FormField label="Reorder level"><input name="reorderLevel" required min="0" step="0.01" type="number" className={inputClass} /></FormField><FormField label="Sale price"><input name="salePrice" required min="0" step="0.01" type="number" className={inputClass} /></FormField><div className="flex justify-end gap-3 sm:col-span-2"><button type="button" onClick={() => setShowForm(false)} className={secondaryButtonClass}>Cancel</button><button className={primaryButtonClass}>Save product</button></div></form></Modal>}
  </div>;
}

function Summary({ label, value, icon, warning = false }: { label: string; value: string; icon: React.ReactNode; warning?: boolean }) {
  return <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><div className={`grid h-11 w-11 place-items-center rounded-xl ${warning ? "bg-amber-50 text-amber-600" : "bg-violet-50 text-violet-600"}`}>{icon}</div><div><p className="text-sm text-slate-500">{label}</p><p className="text-xl font-bold text-slate-900">{value}</p></div></div>;
}
