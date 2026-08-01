import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type StockType = "raw" | "finished";
export type MovementType = "IN" | "OUT";
export type LedgerType = "Sale" | "Payment" | "Return";
export type TransactionType = "Purchase" | "Production" | "Sale" | "Payment" | "Return";

export interface RawMaterial {
  id: number;
  name: string;
  sku: string;
  unit: string;
  stock: number;
  openingStock: number;
  reorderLevel: number;
  unitCost: number;
}

export interface FinishedProduct {
  id: number;
  name: string;
  sku: string;
  unit: string;
  stock: number;
  openingStock: number;
  reorderLevel: number;
  salePrice: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
}

export interface Purchase {
  id: number;
  ref: string;
  supplier: string;
  materialId: number;
  quantity: number;
  unitCost: number;
  total: number;
  date: string;
}

export interface Production {
  id: number;
  ref: string;
  materialId: number;
  materialQuantity: number;
  productId: number;
  productQuantity: number;
  date: string;
}

export interface Sale {
  id: number;
  ref: string;
  customerId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  total: number;
  date: string;
}

export interface ProductReturn {
  id: number;
  ref: string;
  customerId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  total: number;
  date: string;
}

export interface LedgerEntry {
  id: number;
  customerId: number;
  type: LedgerType;
  ref: string;
  debit: number;
  credit: number;
  date: string;
  note: string;
}

export interface StockMovement {
  id: number;
  stockType: StockType;
  itemId: number;
  itemName: string;
  type: MovementType;
  quantity: number;
  reason: TransactionType;
  ref: string;
  date: string;
}

export interface DailyTransaction {
  id: number;
  type: TransactionType;
  ref: string;
  party: string;
  amount: number;
  date: string;
}

export interface InventoryState {
  rawMaterials: RawMaterial[];
  finishedProducts: FinishedProduct[];
  customers: Customer[];
  purchases: Purchase[];
  productions: Production[];
  sales: Sale[];
  returns: ProductReturn[];
  ledger: LedgerEntry[];
  stockMovements: StockMovement[];
  transactions: DailyTransaction[];
}

const initialState: InventoryState = {
  rawMaterials: [
    { id: 1, name: "Flour", sku: "RM-FLR-001", unit: "kg", stock: 420, openingStock: 350, reorderLevel: 120, unitCost: 0.82 },
    { id: 2, name: "Sugar", sku: "RM-SGR-002", unit: "kg", stock: 86, openingStock: 86, reorderLevel: 100, unitCost: 0.74 },
    { id: 3, name: "Butter", sku: "RM-BTR-003", unit: "kg", stock: 42, openingStock: 50, reorderLevel: 30, unitCost: 5.4 },
    { id: 4, name: "Packaging", sku: "RM-PKG-004", unit: "pcs", stock: 640, openingStock: 440, reorderLevel: 200, unitCost: 0.12 },
  ],
  finishedProducts: [
    { id: 1, name: "Classic Loaf", sku: "FG-LOAF-001", unit: "pcs", stock: 168, openingStock: 120, reorderLevel: 50, salePrice: 3.5 },
    { id: 2, name: "Butter Cookies", sku: "FG-COOKIE-002", unit: "packs", stock: 34, openingStock: 19, reorderLevel: 40, salePrice: 5.75 },
    { id: 3, name: "Celebration Cake", sku: "FG-CAKE-003", unit: "pcs", stock: 18, openingStock: 18, reorderLevel: 8, salePrice: 28 },
  ],
  customers: [
    { id: 1, name: "Fresh Mart", phone: "+1 555 0142" },
    { id: 2, name: "City Cafe", phone: "+1 555 0178" },
    { id: 3, name: "Daily Grocers", phone: "+1 555 0194" },
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
  returns: [
    { id: 1, ref: "RET-0001", customerId: 2, productId: 2, quantity: 1, unitPrice: 5.75, total: 5.75, date: "2026-08-01T14:00:00.000Z" },
  ],
  ledger: [
    { id: 1, customerId: 1, type: "Sale", ref: "SAL-0001", debit: 42, credit: 0, date: "2026-08-01T11:10:00.000Z", note: "12 pcs Classic Loaf" },
    { id: 2, customerId: 1, type: "Payment", ref: "PAY-0001", debit: 0, credit: 20, date: "2026-08-01T11:12:00.000Z", note: "Payment received" },
    { id: 3, customerId: 2, type: "Sale", ref: "SAL-0002", debit: 34.5, credit: 0, date: "2026-07-31T15:45:00.000Z", note: "6 packs Butter Cookies" },
    { id: 4, customerId: 2, type: "Return", ref: "RET-0001", debit: 0, credit: 5.75, date: "2026-08-01T14:00:00.000Z", note: "1 pack Butter Cookies returned" },
  ],
  stockMovements: [
    { id: 1, stockType: "raw", itemId: 1, itemName: "Flour", type: "IN", quantity: 100, reason: "Purchase", ref: "PUR-0001", date: "2026-08-01T08:15:00.000Z" },
    { id: 2, stockType: "raw", itemId: 1, itemName: "Flour", type: "OUT", quantity: 30, reason: "Production", ref: "PRD-0001", date: "2026-08-01T09:20:00.000Z" },
    { id: 3, stockType: "finished", itemId: 1, itemName: "Classic Loaf", type: "IN", quantity: 60, reason: "Production", ref: "PRD-0001", date: "2026-08-01T09:20:00.000Z" },
    { id: 4, stockType: "finished", itemId: 1, itemName: "Classic Loaf", type: "OUT", quantity: 12, reason: "Sale", ref: "SAL-0001", date: "2026-08-01T11:10:00.000Z" },
    { id: 5, stockType: "finished", itemId: 2, itemName: "Butter Cookies", type: "IN", quantity: 1, reason: "Return", ref: "RET-0001", date: "2026-08-01T14:00:00.000Z" },
    { id: 6, stockType: "raw", itemId: 4, itemName: "Packaging", type: "IN", quantity: 200, reason: "Purchase", ref: "PUR-0002", date: "2026-07-31T10:30:00.000Z" },
    { id: 7, stockType: "raw", itemId: 3, itemName: "Butter", type: "OUT", quantity: 8, reason: "Production", ref: "PRD-0002", date: "2026-07-31T12:10:00.000Z" },
    { id: 8, stockType: "finished", itemId: 2, itemName: "Butter Cookies", type: "IN", quantity: 20, reason: "Production", ref: "PRD-0002", date: "2026-07-31T12:10:00.000Z" },
    { id: 9, stockType: "finished", itemId: 2, itemName: "Butter Cookies", type: "OUT", quantity: 6, reason: "Sale", ref: "SAL-0002", date: "2026-07-31T15:45:00.000Z" },
  ],
  transactions: [
    { id: 1, type: "Purchase", ref: "PUR-0001", party: "Golden Grain Supplies", amount: 82, date: "2026-08-01T08:15:00.000Z" },
    { id: 2, type: "Production", ref: "PRD-0001", party: "Classic Loaf", amount: 0, date: "2026-08-01T09:20:00.000Z" },
    { id: 3, type: "Sale", ref: "SAL-0001", party: "Fresh Mart", amount: 42, date: "2026-08-01T11:10:00.000Z" },
    { id: 4, type: "Payment", ref: "PAY-0001", party: "Fresh Mart", amount: 20, date: "2026-08-01T11:12:00.000Z" },
    { id: 5, type: "Return", ref: "RET-0001", party: "City Cafe", amount: 5.75, date: "2026-08-01T14:00:00.000Z" },
    { id: 6, type: "Purchase", ref: "PUR-0002", party: "PackRight Co.", amount: 24, date: "2026-07-31T10:30:00.000Z" },
    { id: 7, type: "Production", ref: "PRD-0002", party: "Butter Cookies", amount: 0, date: "2026-07-31T12:10:00.000Z" },
    { id: 8, type: "Sale", ref: "SAL-0002", party: "City Cafe", amount: 34.5, date: "2026-07-31T15:45:00.000Z" },
  ],
};

const nextId = (items: { id: number }[]) => Math.max(0, ...items.map((item) => item.id)) + 1;
const makeRef = (prefix: string, id: number) => `${prefix}-${id.toString().padStart(4, "0")}`;

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    hydrateInventory: (_state, action: PayloadAction<InventoryState>) => action.payload,
    addRawMaterial: (state, action: PayloadAction<Omit<RawMaterial, "id" | "openingStock">>) => {
      state.rawMaterials.push({ ...action.payload, id: nextId(state.rawMaterials), openingStock: action.payload.stock });
    },
    addFinishedProduct: (state, action: PayloadAction<Omit<FinishedProduct, "id" | "openingStock">>) => {
      state.finishedProducts.push({ ...action.payload, id: nextId(state.finishedProducts), openingStock: action.payload.stock });
    },
    recordPurchase: (state, action: PayloadAction<{ supplier: string; materialId: number; quantity: number; unitCost: number; date: string }>) => {
      const material = state.rawMaterials.find((item) => item.id === action.payload.materialId);
      if (!material) return;
      const id = nextId(state.purchases);
      const ref = makeRef("PUR", id);
      const total = action.payload.quantity * action.payload.unitCost;
      material.stock += action.payload.quantity;
      material.unitCost = action.payload.unitCost;
      state.purchases.unshift({ id, ref, total, ...action.payload });
      state.stockMovements.unshift({ id: nextId(state.stockMovements), stockType: "raw", itemId: material.id, itemName: material.name, type: "IN", quantity: action.payload.quantity, reason: "Purchase", ref, date: action.payload.date });
      state.transactions.unshift({ id: nextId(state.transactions), type: "Purchase", ref, party: action.payload.supplier, amount: total, date: action.payload.date });
    },
    recordProduction: (state, action: PayloadAction<{ materialId: number; materialQuantity: number; productId: number; productQuantity: number; date: string }>) => {
      const material = state.rawMaterials.find((item) => item.id === action.payload.materialId);
      const product = state.finishedProducts.find((item) => item.id === action.payload.productId);
      if (!material || !product || material.stock < action.payload.materialQuantity) return;
      const id = nextId(state.productions);
      const ref = makeRef("PRD", id);
      material.stock -= action.payload.materialQuantity;
      product.stock += action.payload.productQuantity;
      state.productions.unshift({ id, ref, ...action.payload });
      state.stockMovements.unshift(
        { id: nextId(state.stockMovements), stockType: "finished", itemId: product.id, itemName: product.name, type: "IN", quantity: action.payload.productQuantity, reason: "Production", ref, date: action.payload.date },
        { id: nextId(state.stockMovements) + 1, stockType: "raw", itemId: material.id, itemName: material.name, type: "OUT", quantity: action.payload.materialQuantity, reason: "Production", ref, date: action.payload.date },
      );
      state.transactions.unshift({ id: nextId(state.transactions), type: "Production", ref, party: product.name, amount: 0, date: action.payload.date });
    },
    recordSale: (state, action: PayloadAction<{ customerId: number; productId: number; quantity: number; unitPrice: number; payment: number; date: string }>) => {
      const customer = state.customers.find((item) => item.id === action.payload.customerId);
      const product = state.finishedProducts.find((item) => item.id === action.payload.productId);
      if (!customer || !product || product.stock < action.payload.quantity) return;
      const id = nextId(state.sales);
      const ref = makeRef("SAL", id);
      const total = action.payload.quantity * action.payload.unitPrice;
      product.stock -= action.payload.quantity;
      state.sales.unshift({ id, ref, customerId: customer.id, productId: product.id, quantity: action.payload.quantity, unitPrice: action.payload.unitPrice, total, date: action.payload.date });
      state.stockMovements.unshift({ id: nextId(state.stockMovements), stockType: "finished", itemId: product.id, itemName: product.name, type: "OUT", quantity: action.payload.quantity, reason: "Sale", ref, date: action.payload.date });
      state.ledger.unshift({ id: nextId(state.ledger), customerId: customer.id, type: "Sale", ref, debit: total, credit: 0, date: action.payload.date, note: `${action.payload.quantity} ${product.unit} ${product.name}` });
      state.transactions.unshift({ id: nextId(state.transactions), type: "Sale", ref, party: customer.name, amount: total, date: action.payload.date });
      if (action.payload.payment > 0) {
        const paymentId = nextId(state.ledger);
        const paymentRef = makeRef("PAY", paymentId);
        state.ledger.unshift({ id: paymentId, customerId: customer.id, type: "Payment", ref: paymentRef, debit: 0, credit: action.payload.payment, date: action.payload.date, note: "Payment received with sale" });
        state.transactions.unshift({ id: nextId(state.transactions), type: "Payment", ref: paymentRef, party: customer.name, amount: action.payload.payment, date: action.payload.date });
      }
    },
    recordPayment: (state, action: PayloadAction<{ customerId: number; amount: number; date: string }>) => {
      const customer = state.customers.find((item) => item.id === action.payload.customerId);
      if (!customer) return;
      const id = nextId(state.ledger);
      const ref = makeRef("PAY", id);
      state.ledger.unshift({ id, customerId: customer.id, type: "Payment", ref, debit: 0, credit: action.payload.amount, date: action.payload.date, note: "Customer payment received" });
      state.transactions.unshift({ id: nextId(state.transactions), type: "Payment", ref, party: customer.name, amount: action.payload.amount, date: action.payload.date });
    },
    recordReturn: (state, action: PayloadAction<{ customerId: number; productId: number; quantity: number; unitPrice: number; date: string }>) => {
      const customer = state.customers.find((item) => item.id === action.payload.customerId);
      const product = state.finishedProducts.find((item) => item.id === action.payload.productId);
      if (!customer || !product) return;
      const id = nextId(state.returns);
      const ref = makeRef("RET", id);
      const total = action.payload.quantity * action.payload.unitPrice;
      product.stock += action.payload.quantity;
      state.returns.unshift({ id, ref, customerId: customer.id, productId: product.id, quantity: action.payload.quantity, unitPrice: action.payload.unitPrice, total, date: action.payload.date });
      state.stockMovements.unshift({ id: nextId(state.stockMovements), stockType: "finished", itemId: product.id, itemName: product.name, type: "IN", quantity: action.payload.quantity, reason: "Return", ref, date: action.payload.date });
      state.ledger.unshift({ id: nextId(state.ledger), customerId: customer.id, type: "Return", ref, debit: 0, credit: total, date: action.payload.date, note: `${action.payload.quantity} ${product.unit} ${product.name} returned` });
      state.transactions.unshift({ id: nextId(state.transactions), type: "Return", ref, party: customer.name, amount: total, date: action.payload.date });
    },
  },
});

export const {
  hydrateInventory,
  addRawMaterial,
  addFinishedProduct,
  recordPurchase,
  recordProduction,
  recordSale,
  recordPayment,
  recordReturn,
} = inventorySlice.actions;

export default inventorySlice.reducer;
