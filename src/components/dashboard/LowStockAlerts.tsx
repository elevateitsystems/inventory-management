// components/dashboard/LowStockAlerts.tsx
"use client";

import { AlertCircle } from "lucide-react";

export default function LowStockAlerts() {
  const alerts = [
    { name: "Laptop Pro X", stock: 3, threshold: 10, urgency: "high" },
    { name: "Wireless Mouse", stock: 5, threshold: 15, urgency: "medium" },
    { name: "USB-C Cable", stock: 8, threshold: 20, urgency: "medium" },
    { name: "External SSD", stock: 2, threshold: 5, urgency: "critical" },
  ];

  const urgencyColors: any = {
    critical: "bg-rose-100 text-rose-700",
    high: "bg-amber-100 text-amber-700",
    medium: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-gray-900">Low Stock Alerts</h3>
          <AlertCircle className="w-4 h-4 text-amber-500" />
        </div>
        <span className="text-xs font-medium text-gray-500">4 items need attention</span>
      </div>
      <div className="space-y-3">
        {alerts.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">Stock: {item.stock} units</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${urgencyColors[item.urgency]}`}>
                {item.urgency}
              </span>
              <span className="text-xs text-gray-400">Threshold: {item.threshold}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}