
"use client";

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleShowAllTransactions } from '@/store/slices/clientSlice';
import { Calendar, RefreshCw } from "lucide-react";

import { mockData } from "@/lib/mockData";
import StatCard from "../StatCard";
import TransactionsTable from "../TransactionsTable";
import LowStockAlerts from "../LowStockAlerts";
import StockMovementChart from "../StockMovementChart";

export default function DashboardTab() {
  const dispatch = useAppDispatch();
  
  //  Get state from Redux instead of useState
  const showAllTransactions = useAppSelector((state) => state.client.showAllTransactions);

  // Handle toggle - dispatch action instead of setState
  const handleToggleShowAll = () => {
    dispatch(toggleShowAllTransactions());
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome back, John! Here's what's happening with your inventory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            July 13, 2026
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value="1,284"
          icon="Package"
          change="12.5%"
          changeType="up"
          color="indigo"
        />
        <StatCard
          title="Total Sales"
          value="$24,890"
          icon="DollarSign"
          change="8.2%"
          changeType="up"
          color="green"
        />
        <StatCard
          title="Total Purchases"
          value="$16,430"
          icon="ShoppingCart"
          change="3.1%"
          changeType="down"
          color="blue"
        />
        <StatCard
          title="Active Clients"
          value="342"
          icon="Users"
          change="15.3%"
          changeType="up"
          color="amber"
        />
      </div>

      {/* Stock Movement Chart */}
      <StockMovementChart/>

      {/* Recent Transactions */}
      <TransactionsTable
        transactions={mockData.transactions}
        showAll={showAllTransactions}
        onToggleShowAll={handleToggleShowAll}
      />

      {/* Low Stock Alerts */}
      <LowStockAlerts />
    </div>
  );
}