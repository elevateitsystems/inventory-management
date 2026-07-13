// components/dashboard/StatCard.tsx
"use client";

import {
  Package,
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: "up" | "down";
  color?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  change,
  changeType = "up",
  color = "indigo",
}: StatCardProps) {
  const iconMap: any = {
    Package,
    DollarSign,
    ShoppingCart,
    Users,
  };

  const Icon = iconMap[icon] || Package;

  const colorClasses: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div
          className={`w-11 h-11 rounded-xl ${colorClasses[color]} flex items-center justify-center shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-1.5 mt-3">
          {changeType === "up" ? (
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          )}
          <span
            className={`text-xs font-semibold ${
              changeType === "up" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {change}
          </span>
          <span className="text-xs text-gray-400">vs last month</span>
        </div>
      )}
    </div>
  );
}