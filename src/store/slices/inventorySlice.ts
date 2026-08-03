import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type StockType = "raw" | "finished";
export type MovementType = "IN" | "OUT";
export type LedgerType = "Sale" | "Payment" | "Return";
export type TransactionType = "Purchase" | "Production" | "Sale" | "Payment" | "Return";

export interface RawMaterial { id: number; name: string; sku: string; unit: string; stock: number; openingStock: number; reorderLevel: number; unitCost: number; active: boolean }
export interface FinishedProduct { id: number; name: string; sku: string; unit: string; stock: number; openingStock: number; reorderLevel: number; salePrice: number; active: boolean }
export interface Customer { id: number; name: string; phone: string; email: string; active: boolean }
export interface Purchase { id: number; ref: string; supplier: string; materialId: number; quantity: number; unitCost: number; total: number; date: string }
export interface Production { id: number; ref: string; materialId: number; materialQuantity: number; productId: number; productQuantity: number; date: string }
export interface Sale { id: number; ref: string; customerId: number; productId: number; quantity: number; unitPrice: number; total: number; date: string }
export interface ProductReturn { id: number; ref: string; customerId: number; productId: number; quantity: number; unitPrice: number; total: number; date: string }
export interface Payment { id: number; ref: string; customerId: number; amount: number; date: string; note: string }
export interface LedgerEntry { id: number; customerId: number; type: LedgerType; ref: string; debit: number; credit: number; date: string; note: string }
export interface StockMovement { id: number; stockType: StockType; itemId: number; itemName: string; type: MovementType; quantity: number; reason: TransactionType; ref: string; date: string }
export interface DailyTransaction { id: number; type: TransactionType; ref: string; party: string; amount: number; date: string }

export interface InventoryState {
  rawMaterials: RawMaterial[]; finishedProducts: FinishedProduct[]; customers: Customer[];
  purchases: Purchase[]; productions: Production[]; sales: Sale[]; returns: ProductReturn[]; payments: Payment[];
  ledger: LedgerEntry[]; stockMovements: StockMovement[]; transactions: DailyTransaction[];
}

const initialState: InventoryState = {
  rawMaterials: [
    { id: 1, name: "Flour", sku: "RM-FLR-001", unit: "kg", stock: 420, openingStock: 350, reorderLevel: 120, unitCost: 0.82, active: true },
    { id: 2, name: "Sugar", sku: "RM-SGR-002", unit: "kg", stock: 86, openingStock: 86, reorderLevel: 100, unitCost: 0.74, active: true },
    { id: 3, name: "Butter", sku: "RM-BTR-003", unit: "kg", stock: 42, openingStock: 50, reorderLevel: 30, unitCost: 5.4, active: true },
    { id: 4, name: "Packaging", sku: "RM-PKG-004", unit: "pcs", stock: 640, openingStock: 440, reorderLevel: 200, unitCost: 0.12, active: true },
  ],
  finishedProducts: [
    { id: 1, name: "Classic Loaf", sku: "FG-LOAF-001", unit: "pcs", stock: 168, openingStock: 120, reorderLevel: 50, salePrice: 3.5, active: true },
    { id: 2, name: "Butter Cookies", sku: "FG-COOKIE-002", unit: "packs", stock: 34, openingStock: 19, reorderLevel: 40, salePrice: 5.75, active: true },
    { id: 3, name: "Celebration Cake", sku: "FG-CAKE-003", unit: "pcs", stock: 18, openingStock: 18, reorderLevel: 8, salePrice: 28, active: true },
  ],
  customers: [
    { id: 1, name: "Fresh Mart", phone: "+1 555 0142", email: "orders@freshmart.test", active: true },
    { id: 2, name: "City Cafe", phone: "+1 555 0178", email: "accounts@citycafe.test", active: true },
    { id: 3, name: "Daily Grocers", phone: "+1 555 0194", email: "hello@dailygrocers.test", active: true },
  ],
  purchases: [
    { id: 1, ref: "PUR-0001", supplier: "Golden Grain Supplies", materialId: 1, quantity: 100, unitCost: 0.82, total: 82, date: "2026-08-01T08:15:00.000Z" },
    { id: 2, ref: "PUR-0002", supplier: "PackRight Co.", materialId: 4, quantity: 200, unitCost: 0.12, total: 24, date: "2026-07-31T10:30:00.000Z" },
  ],
  productions: [
    { id: 1, ref: "PRD-0001", materialId: 1, materialQuantity: 30, productId: 1, productQuantity: 60, date: "2026-08-01T09:20:00.000Z" },
    { id: 2, ref: "PRD-0002", materialId: 3, materialQuantity: 8, productId: 2, productQuantity: 20, date: "2026-07-31T12:10:00.000Z" },
  ],
  sales: [
    { id: 1, ref: "SAL-0001", customerId: 1, productId: 1, quantity: 12, unitPrice: 3.5, total: 42, date: "2026-08-01T11:10:00.000Z" },
    { id: 2, ref: "SAL-0002", customerId: 2, productId: 2, quantity: 6, unitPrice: 5.75, total: 34.5, date: "2026-07-31T15:45:00.000Z" },
  ],
  returns: [{ id: 1, ref: "RET-0001", customerId: 2, productId: 2, quantity: 1, unitPrice: 5.75, total: 5.75, date: "2026-08-01T14:00:00.000Z" }],
  payments: [{ id: 1, ref: "PAY-0001", customerId: 1, amount: 20, date: "2026-08-01T11:12:00.000Z", note: "Payment received" }],
  ledger: [], stockMovements: [], transactions: [],
};

const nextId = (items: { id: number }[]) => Math.max(0, ...items.map((item) => item.id)) + 1;
const makeRef = (prefix: string, id: number) => `${prefix}-${id.toString().padStart(4, "0")}`;

function rebuildDerived(state: InventoryState) {
  state.rawMaterials.forEach((item) => { item.stock = item.openingStock; });
  state.finishedProducts.forEach((item) => { item.stock = item.openingStock; });
  const movements: StockMovement[] = [];
  const ledger: LedgerEntry[] = [];
  const transactions: DailyTransaction[] = [];
  let movementId = 1, ledgerId = 1, transactionId = 1;
  state.purchases.forEach((row) => {
    row.total = row.quantity * row.unitCost;
    const material = state.rawMaterials.find((item) => item.id === row.materialId);
    if (!material) return;
    material.stock += row.quantity;
    movements.push({ id: movementId++, stockType: "raw", itemId: material.id, itemName: material.name, type: "IN", quantity: row.quantity, reason: "Purchase", ref: row.ref, date: row.date });
    transactions.push({ id: transactionId++, type: "Purchase", ref: row.ref, party: row.supplier, amount: row.total, date: row.date });
  });
  state.productions.forEach((row) => {
    const material = state.rawMaterials.find((item) => item.id === row.materialId);
    const product = state.finishedProducts.find((item) => item.id === row.productId);
    if (!material || !product) return;
    material.stock -= row.materialQuantity; product.stock += row.productQuantity;
    movements.push({ id: movementId++, stockType: "raw", itemId: material.id, itemName: material.name, type: "OUT", quantity: row.materialQuantity, reason: "Production", ref: row.ref, date: row.date });
    movements.push({ id: movementId++, stockType: "finished", itemId: product.id, itemName: product.name, type: "IN", quantity: row.productQuantity, reason: "Production", ref: row.ref, date: row.date });
    transactions.push({ id: transactionId++, type: "Production", ref: row.ref, party: product.name, amount: 0, date: row.date });
  });
  state.sales.forEach((row) => {
    row.total = row.quantity * row.unitPrice;
    const product = state.finishedProducts.find((item) => item.id === row.productId);
    const customer = state.customers.find((item) => item.id === row.customerId);
    if (!product || !customer) return;
    product.stock -= row.quantity;
    movements.push({ id: movementId++, stockType: "finished", itemId: product.id, itemName: product.name, type: "OUT", quantity: row.quantity, reason: "Sale", ref: row.ref, date: row.date });
    ledger.push({ id: ledgerId++, customerId: customer.id, type: "Sale", ref: row.ref, debit: row.total, credit: 0, date: row.date, note: `${row.quantity} ${product.unit} ${product.name}` });
    transactions.push({ id: transactionId++, type: "Sale", ref: row.ref, party: customer.name, amount: row.total, date: row.date });
  });
  state.returns.forEach((row) => {
    row.total = row.quantity * row.unitPrice;
    const product = state.finishedProducts.find((item) => item.id === row.productId);
    const customer = state.customers.find((item) => item.id === row.customerId);
    if (!product || !customer) return;
    product.stock += row.quantity;
    movements.push({ id: movementId++, stockType: "finished", itemId: product.id, itemName: product.name, type: "IN", quantity: row.quantity, reason: "Return", ref: row.ref, date: row.date });
    ledger.push({ id: ledgerId++, customerId: customer.id, type: "Return", ref: row.ref, debit: 0, credit: row.total, date: row.date, note: `${row.quantity} ${product.unit} ${product.name} returned` });
    transactions.push({ id: transactionId++, type: "Return", ref: row.ref, party: customer.name, amount: row.total, date: row.date });
  });
  state.payments.forEach((row) => {
    const customer = state.customers.find((item) => item.id === row.customerId);
    if (!customer) return;
    ledger.push({ id: ledgerId++, customerId: customer.id, type: "Payment", ref: row.ref, debit: 0, credit: row.amount, date: row.date, note: row.note });
    transactions.push({ id: transactionId++, type: "Payment", ref: row.ref, party: customer.name, amount: row.amount, date: row.date });
  });
  const newest = <T extends { date: string }>(rows: T[]) => rows.sort((a, b) => b.date.localeCompare(a.date));
  state.stockMovements = newest(movements); state.ledger = newest(ledger); state.transactions = newest(transactions);
}

rebuildDerived(initialState);

type MaterialInput = Omit<RawMaterial, "id" | "stock"> & { stock?: number };
type ProductInput = Omit<FinishedProduct, "id" | "stock"> & { stock?: number };

const inventorySlice = createSlice({
  name: "inventory", initialState,
  reducers: {
    hydrateInventory: (_state, action: PayloadAction<InventoryState>) => {
      const next = action.payload;
      next.rawMaterials = (next.rawMaterials ?? []).map((x) => ({ ...x, active: x.active ?? true }));
      next.finishedProducts = (next.finishedProducts ?? []).map((x) => ({ ...x, active: x.active ?? true }));
      next.customers = (next.customers ?? []).map((x) => ({ ...x, email: x.email ?? "", active: x.active ?? true }));
      next.payments ??= (next.ledger ?? []).filter((x) => x.type === "Payment").map((x, i) => ({ id: i + 1, ref: x.ref, customerId: x.customerId, amount: x.credit, date: x.date, note: x.note }));
      rebuildDerived(next); return next;
    },
    resetInventory: () => initialState,
    addRawMaterial: (state, action: PayloadAction<Omit<RawMaterial, "id" | "stock" | "openingStock"> & { stock: number }>) => { state.rawMaterials.push({ ...action.payload, id: nextId(state.rawMaterials), openingStock: action.payload.stock, stock: action.payload.stock }); rebuildDerived(state); },
    updateRawMaterial: (state, action: PayloadAction<{ id: number; changes: MaterialInput }>) => { const row = state.rawMaterials.find(x => x.id === action.payload.id); if (row) Object.assign(row, action.payload.changes); rebuildDerived(state); },
    deleteRawMaterial: (state, action: PayloadAction<number>) => { state.rawMaterials = state.rawMaterials.filter(x => x.id !== action.payload); rebuildDerived(state); },
    toggleRawMaterial: (state, action: PayloadAction<number>) => { const row = state.rawMaterials.find(x => x.id === action.payload); if (row) row.active = !row.active; },
    addFinishedProduct: (state, action: PayloadAction<Omit<FinishedProduct, "id" | "stock" | "openingStock"> & { stock: number }>) => { state.finishedProducts.push({ ...action.payload, id: nextId(state.finishedProducts), openingStock: action.payload.stock, stock: action.payload.stock }); rebuildDerived(state); },
    updateFinishedProduct: (state, action: PayloadAction<{ id: number; changes: ProductInput }>) => { const row = state.finishedProducts.find(x => x.id === action.payload.id); if (row) Object.assign(row, action.payload.changes); rebuildDerived(state); },
    deleteFinishedProduct: (state, action: PayloadAction<number>) => { state.finishedProducts = state.finishedProducts.filter(x => x.id !== action.payload); rebuildDerived(state); },
    toggleFinishedProduct: (state, action: PayloadAction<number>) => { const row = state.finishedProducts.find(x => x.id === action.payload); if (row) row.active = !row.active; },
    addCustomer: (state, action: PayloadAction<Omit<Customer, "id">>) => { state.customers.push({ ...action.payload, id: nextId(state.customers) }); },
    updateCustomer: (state, action: PayloadAction<Customer>) => { const row = state.customers.find(x => x.id === action.payload.id); if (row) Object.assign(row, action.payload); rebuildDerived(state); },
    deleteCustomer: (state, action: PayloadAction<number>) => { state.customers = state.customers.filter(x => x.id !== action.payload); rebuildDerived(state); },
    toggleCustomer: (state, action: PayloadAction<number>) => { const row = state.customers.find(x => x.id === action.payload); if (row) row.active = !row.active; },
    recordPurchase: (state, action: PayloadAction<Omit<Purchase, "id" | "ref" | "total">>) => { const id = nextId(state.purchases); state.purchases.push({ ...action.payload, id, ref: makeRef("PUR", id), total: 0 }); rebuildDerived(state); },
    updatePurchase: (state, action: PayloadAction<Purchase>) => { const row = state.purchases.find(x => x.id === action.payload.id); if (row) Object.assign(row, action.payload); rebuildDerived(state); },
    deletePurchase: (state, action: PayloadAction<number>) => { state.purchases = state.purchases.filter(x => x.id !== action.payload); rebuildDerived(state); },
    recordProduction: (state, action: PayloadAction<Omit<Production, "id" | "ref">>) => { const id = nextId(state.productions); state.productions.push({ ...action.payload, id, ref: makeRef("PRD", id) }); rebuildDerived(state); },
    updateProduction: (state, action: PayloadAction<Production>) => { const row = state.productions.find(x => x.id === action.payload.id); if (row) Object.assign(row, action.payload); rebuildDerived(state); },
    deleteProduction: (state, action: PayloadAction<number>) => { state.productions = state.productions.filter(x => x.id !== action.payload); rebuildDerived(state); },
    recordSale: (state, action: PayloadAction<{ customerId: number; productId: number; quantity: number; unitPrice: number; payment: number; date: string }>) => { const id = nextId(state.sales); const ref = makeRef("SAL", id); const { payment, ...sale } = action.payload; state.sales.push({ ...sale, id, ref, total: 0 }); if (payment > 0) { const paymentId = nextId(state.payments); state.payments.push({ id: paymentId, ref: makeRef("PAY", paymentId), customerId: sale.customerId, amount: payment, date: sale.date, note: `Payment received with ${ref}` }); } rebuildDerived(state); },
    updateSale: (state, action: PayloadAction<Sale>) => { const row = state.sales.find(x => x.id === action.payload.id); if (row) Object.assign(row, action.payload); rebuildDerived(state); },
    deleteSale: (state, action: PayloadAction<number>) => { state.sales = state.sales.filter(x => x.id !== action.payload); rebuildDerived(state); },
    recordPayment: (state, action: PayloadAction<{ customerId: number; amount: number; date: string }>) => { const id = nextId(state.payments); state.payments.push({ id, ref: makeRef("PAY", id), ...action.payload, note: "Customer payment received" }); rebuildDerived(state); },
    updatePayment: (state, action: PayloadAction<Payment>) => { const row = state.payments.find(x => x.id === action.payload.id); if (row) Object.assign(row, action.payload); rebuildDerived(state); },
    deletePayment: (state, action: PayloadAction<number>) => { state.payments = state.payments.filter(x => x.id !== action.payload); rebuildDerived(state); },
    recordReturn: (state, action: PayloadAction<Omit<ProductReturn, "id" | "ref" | "total">>) => { const id = nextId(state.returns); state.returns.push({ ...action.payload, id, ref: makeRef("RET", id), total: 0 }); rebuildDerived(state); },
    updateReturn: (state, action: PayloadAction<ProductReturn>) => { const row = state.returns.find(x => x.id === action.payload.id); if (row) Object.assign(row, action.payload); rebuildDerived(state); },
    deleteReturn: (state, action: PayloadAction<number>) => { state.returns = state.returns.filter(x => x.id !== action.payload); rebuildDerived(state); },
  },
});

export const { hydrateInventory, resetInventory, addRawMaterial, updateRawMaterial, deleteRawMaterial, toggleRawMaterial, addFinishedProduct, updateFinishedProduct, deleteFinishedProduct, toggleFinishedProduct, addCustomer, updateCustomer, deleteCustomer, toggleCustomer, recordPurchase, updatePurchase, deletePurchase, recordProduction, updateProduction, deleteProduction, recordSale, updateSale, deleteSale, recordPayment, updatePayment, deletePayment, recordReturn, updateReturn, deleteReturn } = inventorySlice.actions;
export default inventorySlice.reducer;
