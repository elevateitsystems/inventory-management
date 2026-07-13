// components/dashboard/tabs/ClientsTab.tsx
"use client";

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setClientSearchTerm, setSelectedClient } from '@/store/slices/clientSlice';
import { Search, Filter, UserPlus, X } from "lucide-react";
import { mockData } from "@/lib/mockData";

export default function ClientsTab() {
  const dispatch = useAppDispatch();
  
  //  Get state from Redux instead of useState
  const searchTerm = useAppSelector((state) => state.client.searchTerm);
  const selectedClient = useAppSelector((state) => state.client.selectedClient);

  // Filter clients based on search term
  const filteredClients = mockData.clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers - dispatch actions instead of useState setters
  const handleSearch = (value: string) => {
    dispatch(setClientSearchTerm(value));
  };

  const handleSelectClient = (client: any) => {
    dispatch(setSelectedClient(client));
  };

  const handleCloseModal = () => {
    dispatch(setSelectedClient(null));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500">Manage your client relationships</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSelectClient(client)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{client.name}</h4>
                  <p className="text-xs text-gray-500">{client.email}</p>
                  <p className="text-xs text-gray-500 mt-1">{client.phone}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-md ${
                    client.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {client.status}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs">
                <span className="text-gray-500">
                  Purchases: <strong className="text-gray-900">{client.totalPurchases}</strong>
                </span>
                <span className="text-gray-500">
                  Total: <strong className="text-gray-900">${client.totalSpent.toFixed(2)}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Client Modal */}
      {selectedClient && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{selectedClient.name}</h3>
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
                <span className="text-sm text-gray-900">{selectedClient.email}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Phone:</span>{" "}
                <span className="text-sm text-gray-900">{selectedClient.phone}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status:</span>{" "}
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-md ${
                    selectedClient.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {selectedClient.status}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Purchases:</span>{" "}
                <span className="text-sm text-gray-900">{selectedClient.totalPurchases}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Spent:</span>{" "}
                <span className="text-sm font-semibold text-gray-900">
                  ${selectedClient.totalSpent.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}