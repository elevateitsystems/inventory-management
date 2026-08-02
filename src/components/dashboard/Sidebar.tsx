"use client";

import { BarChart3, Boxes, Factory, LayoutDashboard, PackageCheck, ReceiptText, ShoppingCart, Users } from "lucide-react";

interface SidebarProps { activeTab: string; setActiveTab: (tab: string) => void; }

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Raw Materials", icon: Boxes },
  { name: "Purchases", icon: ShoppingCart },
  { name: "Production", icon: Factory },
  { name: "Finished Products", icon: PackageCheck },
  { name: "Sales", icon: ReceiptText },
  { name: "Customer Ledger", icon: Users },
  { name: "Reports", icon: BarChart3 },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return <aside className="sticky top-0 flex h-screen w-[252px] shrink-0 flex-col border-r border-slate-200 bg-slate-950 text-white">
    <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20"><Boxes className="h-5 w-5" /></div><div><p className="font-bold tracking-tight">StockFlow</p><p className="text-[11px] text-slate-400">Inventory Management</p></div></div>
    <div className="flex-1 overflow-y-auto px-3 py-5"><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Operations</p><nav className="space-y-1">{menuItems.map((item) => <button key={item.name} onClick={() => setActiveTab(item.name)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${activeTab === item.name ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><item.icon className="h-[18px] w-[18px]" />{item.name}</button>)}</nav></div>
    <div className="border-t border-white/10 p-4"><div className="rounded-xl bg-white/5 p-3"><p className="text-xs font-semibold text-white">Inventory Admin</p><p className="mt-0.5 text-[11px] text-slate-500">All operational records saved</p></div></div>
  </aside>;
}
