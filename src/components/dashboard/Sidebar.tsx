
"use client";

import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  ShoppingCart,
  DollarSign,
  FileText,
  Settings,
  ChevronDown,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Clients", icon: Users },
    { name: "Suppliers", icon: Truck },
    { name: "Products", icon: Package },
    { name: "Purchase History", icon: ShoppingCart },
    { name: "Sales History", icon: DollarSign },
    { name: "Reports", icon: FileText },
    { name: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-[260px] bg-white shadow-sm flex flex-col overflow-hidden h-screen sticky top-0 shrink-0">
      <div className="p-5 pb-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">Inventory MS</span>
        </div>
      </div>

      <div className="px-4 flex-1 overflow-y-auto py-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
          Main Menu
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === item.name
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">John Doe</p>
            <p className="text-xs text-gray-500 truncate">Admin</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </aside>
  );
}