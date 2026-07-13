
"use client";

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setProductSearchTerm, setSelectedProduct } from '@/store/slices/clientSlice';
import { Search, Plus, X } from "lucide-react";
import { mockData } from "@/lib/mockData";

export default function ProductsTab() {
  const dispatch = useAppDispatch();
  
  //  Get state from Redux instead of useState
  const searchTerm = useAppSelector((state) => state.client.productSearchTerm);
  const selectedProduct = useAppSelector((state) => state.client.selectedProduct);

  // Filter products based on search term
  const filteredProducts = mockData.products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers - dispatch actions instead of useState setters
  const handleSearch = (value: string) => {
    dispatch(setProductSearchTerm(value));
  };

  const handleSelectProduct = (product: any) => {
    dispatch(setSelectedProduct(product));
  };

  const handleCloseModal = () => {
    dispatch(setSelectedProduct(null));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">Manage your product inventory</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSelectProduct(product)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{product.name}</h4>
                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-md ${
                    product.stock > 20
                      ? "bg-emerald-100 text-emerald-700"
                      : product.stock > 10
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {product.stock} units
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Price: <strong className="text-gray-900">${product.price.toFixed(2)}</strong>
                  </span>
                  <span className="text-gray-500">
                    Category: <strong className="text-gray-900">{product.category}</strong>
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Supplier: {product.supplier}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{selectedProduct.name}</h3>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">SKU:</span>{" "}
                <span className="text-sm text-gray-900">{selectedProduct.sku}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Price:</span>{" "}
                <span className="text-sm font-semibold text-gray-900">
                  ${selectedProduct.price.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Stock:</span>{" "}
                <span className="text-sm text-gray-900">{selectedProduct.stock} units</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Category:</span>{" "}
                <span className="text-sm text-gray-900">{selectedProduct.category}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Supplier:</span>{" "}
                <span className="text-sm text-gray-900">{selectedProduct.supplier}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex gap-2">
                <button className="flex-1 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                  Edit Product
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