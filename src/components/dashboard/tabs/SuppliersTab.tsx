// components/dashboard/tabs/SuppliersTab.tsx
"use client";

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setSupplierSearchTerm, setSelectedSupplier } from '@/store/slices/clientSlice';
import { Search, Plus, Edit, Trash2, X } from "lucide-react";
import { mockData } from "@/lib/mockData";

export default function SuppliersTab() {
  const dispatch = useAppDispatch();
  
  // 🔴 Get state from Redux instead of useState
  const searchTerm = useAppSelector((state) => state.client.supplierSearchTerm);
  const selectedSupplier = useAppSelector((state) => state.client.selectedSupplier);

  // Filter suppliers based on search term
  const filteredSuppliers = mockData.suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers - dispatch actions instead of useState setters
  const handleSearch = (value: string) => {
    dispatch(setSupplierSearchTerm(value));
  };

  const handleViewSupplier = (supplier: any) => {
    dispatch(setSelectedSupplier(supplier));
  };

  const handleCloseModal = () => {
    dispatch(setSelectedSupplier(null));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500">Manage your supplier network</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <span className="text-sm text-gray-500">
            {filteredSuppliers.length} suppliers found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 text-xs font-medium text-gray-500">Supplier</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500">Contact</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500">Products</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500">Rating</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => handleViewSupplier(supplier)}
                >
                  <td className="py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{supplier.name}</p>
                      <p className="text-xs text-gray-500">{supplier.email}</p>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-600">{supplier.phone}</td>
                  <td className="py-3 text-sm text-gray-900">{supplier.products}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {supplier.rating}
                      </span>
                      <span className="text-xs text-gray-400">★</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                        supplier.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {supplier.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Supplier Modal */}
      {selectedSupplier && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{selectedSupplier.name}</h3>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Email:</span>{" "}
                <span className="text-sm text-gray-900">{selectedSupplier.email}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Phone:</span>{" "}
                <span className="text-sm text-gray-900">{selectedSupplier.phone}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Products:</span>{" "}
                <span className="text-sm text-gray-900">{selectedSupplier.products}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Rating:</span>{" "}
                <span className="text-sm font-semibold text-gray-900">
                  {selectedSupplier.rating} ★
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status:</span>{" "}
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-md ${
                    selectedSupplier.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {selectedSupplier.status}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex gap-2">
                <button className="flex-1 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                  Edit Supplier
                </button>
                <button className="flex-1 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}