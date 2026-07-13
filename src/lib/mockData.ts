// lib/mockData.ts
export const mockData = {
  products: [
    { id: 1, name: "Laptop Pro X", sku: "LPX-001", stock: 45, price: 1299.99, category: "Electronics", supplier: "Tech Distributors" },
    { id: 2, name: "Wireless Mouse", sku: "WM-002", stock: 120, price: 29.99, category: "Accessories", supplier: "Global Supplies" },
    { id: 3, name: "USB-C Cable 2M", sku: "USB-003", stock: 85, price: 15.99, category: "Cables", supplier: "Cable Masters" },
    { id: 4, name: "External SSD 1TB", sku: "SSD-004", stock: 12, price: 159.99, category: "Storage", supplier: "Tech Distributors" },
    { id: 5, name: "Bluetooth Speaker", sku: "BTS-005", stock: 30, price: 79.99, category: "Audio", supplier: "Audio Pro" },
  ],
  clients: [
    { id: 1, name: "Tech Solutions Inc.", email: "contact@techsolutions.com", phone: "+1 (555) 123-4567", totalPurchases: 24, totalSpent: 45230.50, status: "Active" },
    { id: 2, name: "Global Supplies Ltd", email: "info@globalsupplies.com", phone: "+1 (555) 987-6543", totalPurchases: 18, totalSpent: 28990.00, status: "Active" },
    { id: 3, name: "ABC Corporation", email: "purchasing@abccorp.com", phone: "+1 (555) 456-7890", totalPurchases: 12, totalSpent: 15240.75, status: "Inactive" },
    { id: 4, name: "XYZ Traders", email: "orders@xyztraders.com", phone: "+1 (555) 789-0123", totalPurchases: 30, totalSpent: 67890.25, status: "Active" },
  ],
  suppliers: [
    { id: 1, name: "Tech Distributors", email: "sales@techdist.com", phone: "+1 (555) 234-5678", products: 45, rating: 4.8, status: "Active" },
    { id: 2, name: "Global Supplies", email: "info@globalsupplies.com", phone: "+1 (555) 876-5432", products: 32, rating: 4.5, status: "Active" },
    { id: 3, name: "Cable Masters", email: "support@cablemasters.com", phone: "+1 (555) 345-6789", products: 18, rating: 4.2, status: "Active" },
    { id: 4, name: "Audio Pro", email: "hello@audiopro.com", phone: "+1 (555) 567-8901", products: 12, rating: 4.9, status: "Inactive" },
  ],
  sales: [
    { id: 1, invoice: "INV-2026-001", client: "Tech Solutions Inc.", products: 3, total: 1245.00, status: "Completed", date: "2026-07-13", payment: "Full" },
    { id: 2, invoice: "INV-2026-002", client: "ABC Corporation", products: 2, total: 890.50, status: "Pending", date: "2026-07-12", payment: "Partial" },
    { id: 3, invoice: "INV-2026-003", client: "Global Supplies Ltd", products: 5, total: 2100.00, status: "Completed", date: "2026-07-12", payment: "Full" },
    { id: 4, invoice: "INV-2026-004", client: "XYZ Traders", products: 1, total: 450.75, status: "Returned", date: "2026-07-11", payment: "Refunded" },
  ],
  purchases: [
    { id: 1, po: "PO-2026-001", supplier: "Tech Distributors", products: 4, total: 3450.00, status: "Received", date: "2026-07-13" },
    { id: 2, po: "PO-2026-002", supplier: "Global Supplies", products: 3, total: 1240.50, status: "Pending", date: "2026-07-12" },
    { id: 3, po: "PO-2026-003", supplier: "Cable Masters", products: 6, total: 780.00, status: "Received", date: "2026-07-11" },
  ],
  transactions: [
    { id: 1, type: "Sale", ref: "INV-2026-001", client: "Tech Solutions Inc.", amount: 1245.00, date: "2026-07-13 14:30", status: "Completed" },
    { id: 2, type: "Purchase", ref: "PO-2026-001", client: "Tech Distributors", amount: 3450.00, date: "2026-07-13 11:15", status: "Completed" },
    { id: 3, type: "Payment", ref: "PAY-2026-001", client: "ABC Corporation", amount: 450.00, date: "2026-07-12 16:45", status: "Completed" },
    { id: 4, type: "Sale", ref: "INV-2026-002", client: "ABC Corporation", amount: 890.50, date: "2026-07-12 10:20", status: "Pending" },
    { id: 5, type: "Return", ref: "RET-2026-001", client: "XYZ Traders", amount: -450.75, date: "2026-07-11 09:00", status: "Completed" },
    { id: 6, type: "Sale", ref: "INV-2026-003", client: "Global Supplies Ltd", amount: 2100.00, date: "2026-07-12 15:45", status: "Completed" },
    { id: 7, type: "Purchase", ref: "PO-2026-002", client: "Global Supplies", amount: 1240.50, date: "2026-07-12 09:30", status: "Pending" },
    { id: 8, type: "Payment", ref: "PAY-2026-002", client: "Tech Solutions Inc.", amount: 750.00, date: "2026-07-11 14:20", status: "Completed" },
  ],
  stockMovements: [
    { id: 1, product: "Laptop Pro X", type: "IN", quantity: 15, date: "2026-07-13 10:30", ref: "PO-2026-001" },
    { id: 2, product: "Wireless Mouse", type: "OUT", quantity: 8, date: "2026-07-13 14:30", ref: "INV-2026-001" },
    { id: 3, product: "USB-C Cable", type: "IN", quantity: 25, date: "2026-07-12 09:15", ref: "PO-2026-002" },
    { id: 4, product: "External SSD", type: "OUT", quantity: 3, date: "2026-07-12 11:45", ref: "INV-2026-002" },
    { id: 5, product: "Bluetooth Speaker", type: "OUT", quantity: 5, date: "2026-07-11 16:30", ref: "INV-2026-003" },
  ],
};