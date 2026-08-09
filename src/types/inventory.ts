export type StockType = "raw" | "finished";
export type MovementType = "IN" | "OUT";
export type LedgerType = "Sale" | "Payment" | "Return";
export type TransactionType =
  "Purchase" | "Production" | "Sale" | "Payment" | "Return";

export interface RawMaterial {
  id: number;
  name: string;
  sku: string;
  unit: string;
  stock: number;
  openingStock: number;
  reorderLevel: number;
  unitCost: number;
  active: boolean;
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
  active: boolean;
}
export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  active: boolean;
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
export interface Payment {
  id: number;
  ref: string;
  customerId: number;
  amount: number;
  date: string;
  note: string;
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
  payments: Payment[];
  ledger: LedgerEntry[];
  stockMovements: StockMovement[];
  transactions: DailyTransaction[];
}

export const emptyInventoryState = (): InventoryState => ({
  rawMaterials: [],
  finishedProducts: [],
  customers: [],
  purchases: [],
  productions: [],
  sales: [],
  returns: [],
  payments: [],
  ledger: [],
  stockMovements: [],
  transactions: [],
});
