
"use client";

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setSalesSearchTerm } from '@/store/slices/clientSlice';
import { Search, DollarSign } from "lucide-react";
import { mockData } from "@/lib/mockData";

export default function SalesHistoryTab() {
  const dispatch = useAppDispatch();
  
  // Get state from Redux instead of useState
  const searchTerm = useAppSelector((state) => state.client.salesSearchTerm);

  // Filter sales based on search term
  const filteredSales = mockData.sales.filter(
    (s) =>
      s.invoice.includes(searchTerm) ||
      s.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handler - dispatch action instead of setState
  const handleSearch = (value: string) => {
    dispatch(setSalesSearchTerm(value));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
          <p className="text-sm text-gray-500">Track all your sales transactions</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          New Sale
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sales..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 text-xs font-medium text-gray-500">Invoice</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500">Client</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500">Products</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500">Total</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500">Payment</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3 text-sm font-medium text-indigo-600">{sale.invoice}</td>
                  <td className="py-3 text-sm text-gray-900">{sale.client}</td>
                  <td className="py-3 text-sm text-gray-600">{sale.products} items</td>
                  <td className="py-3 text-sm font-semibold text-gray-900">
                    ${sale.total.toFixed(2)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                        sale.payment === "Full"
                          ? "bg-emerald-100 text-emerald-700"
                          : sale.payment === "Partial"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {sale.payment}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                        sale.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : sale.status === "Pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {sale.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-500">{sale.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}