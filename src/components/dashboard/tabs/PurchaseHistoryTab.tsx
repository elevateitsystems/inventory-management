
"use client";

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setPurchaseSearchTerm } from '@/store/slices/clientSlice';
import { Search, ShoppingCart } from "lucide-react";
import { mockData } from "@/lib/mockData";

export default function PurchaseHistoryTab() {
  const dispatch = useAppDispatch();
  
  //  Get state from Redux instead of useState
  const searchTerm = useAppSelector((state) => state.client.purchaseSearchTerm);

  // Filter purchases based on search term
  const filteredPurchases = mockData.purchases.filter(
    (p) =>
      p.po.includes(searchTerm) ||
      p.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handler - dispatch action instead of setState
  const handleSearch = (value: string) => {
    dispatch(setPurchaseSearchTerm(value));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase History</h1>
          <p className="text-sm text-gray-500">Track all your purchase orders</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          New Purchase
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search purchases..."
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
                <th className="text-left py-3 text-xs font-medium text-gray-500">PO Number</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500">Supplier</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500">Products</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500">Total</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((purchase) => (
                <tr
                  key={purchase.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3 text-sm font-medium text-indigo-600">{purchase.po}</td>
                  <td className="py-3 text-sm text-gray-900">{purchase.supplier}</td>
                  <td className="py-3 text-sm text-gray-600">{purchase.products} items</td>
                  <td className="py-3 text-sm font-semibold text-gray-900">
                    ${purchase.total.toFixed(2)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                        purchase.status === "Received"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {purchase.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-500">{purchase.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}