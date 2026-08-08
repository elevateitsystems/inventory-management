import {
  createAsyncThunk,
  createSlice,
  isAnyOf,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { ApiClientError, apiRequest } from "@/lib/api";
import {
  emptyInventoryState,
  type Customer,
  type FinishedProduct,
  type InventoryState,
  type Payment,
  type Production,
  type ProductReturn,
  type Purchase,
  type RawMaterial,
  type Sale,
} from "@/types/inventory";

export type * from "@/types/inventory";
type RootLike = { inventory: InventoryState };
const inventoryCollections = [
  "rawMaterials",
  "finishedProducts",
  "customers",
  "purchases",
  "productions",
  "sales",
  "returns",
  "payments",
  "ledger",
  "stockMovements",
  "transactions",
] as const satisfies readonly (keyof InventoryState)[];

function ensureInventoryState(value: InventoryState) {
  if (!value || !inventoryCollections.every((key) => Array.isArray(value[key])))
    throw new Error("The server returned an invalid inventory response.");
  return value;
}

const post = async (type: string, payload: unknown) => {
  const updated = await apiRequest<InventoryState>("/api/inventory/actions", {
    method: "POST",
    body: JSON.stringify({ type, payload }),
  });
  return ensureInventoryState(updated);
};
const thunk = <P>(
  name: string,
  build: (payload: P, state: RootLike) => { type: string; payload: unknown },
) =>
  createAsyncThunk<InventoryState, P, { state: RootLike }>(
    `inventory/${name}`,
    async (payload, { getState }) => {
      const action = build(payload, getState());
      return post(action.type, action.payload);
    },
  );

export const fetchInventory = createAsyncThunk<
  InventoryState,
  void,
  { rejectValue: { status: number; message: string } }
>("inventory/fetch", async (_payload, { rejectWithValue }) => {
  try {
    return ensureInventoryState(
      await apiRequest<InventoryState>("/api/inventory"),
    );
  } catch (error) {
    if (error instanceof ApiClientError) {
      return rejectWithValue({ status: error.status, message: error.message });
    }
    throw error;
  }
});
export const addRawMaterial = thunk<
  Omit<RawMaterial, "id" | "stock" | "openingStock"> & { stock: number }
>("addRawMaterial", (p) => ({
  type: "material.create",
  payload: { ...p, openingStock: p.stock },
}));
export const updateRawMaterial = thunk<{
  id: number;
  changes: Omit<RawMaterial, "id" | "stock"> & { stock?: number };
}>("updateRawMaterial", (p, s) => {
  const old = s.inventory.rawMaterials.find((x) => x.id === p.id);
  return {
    type: "material.update",
    payload: { ...old, ...p.changes, id: p.id },
  };
});
export const deleteRawMaterial = thunk<number>("deleteRawMaterial", (id) => ({
  type: "material.delete",
  payload: { id },
}));
export const toggleRawMaterial = thunk<number>("toggleRawMaterial", (id) => ({
  type: "material.toggle",
  payload: { id },
}));
export const addFinishedProduct = thunk<
  Omit<FinishedProduct, "id" | "stock" | "openingStock"> & { stock: number }
>("addFinishedProduct", (p) => ({
  type: "product.create",
  payload: { ...p, openingStock: p.stock },
}));
export const updateFinishedProduct = thunk<{
  id: number;
  changes: Omit<FinishedProduct, "id" | "stock"> & { stock?: number };
}>("updateFinishedProduct", (p, s) => {
  const old = s.inventory.finishedProducts.find((x) => x.id === p.id);
  return {
    type: "product.update",
    payload: { ...old, ...p.changes, id: p.id },
  };
});
export const deleteFinishedProduct = thunk<number>(
  "deleteFinishedProduct",
  (id) => ({ type: "product.delete", payload: { id } }),
);
export const toggleFinishedProduct = thunk<number>(
  "toggleFinishedProduct",
  (id) => ({ type: "product.toggle", payload: { id } }),
);
export const addCustomer = thunk<Omit<Customer, "id">>("addCustomer", (p) => ({
  type: "customer.create",
  payload: p,
}));
export const updateCustomer = thunk<Customer>("updateCustomer", (p) => ({
  type: "customer.update",
  payload: p,
}));
export const deleteCustomer = thunk<number>("deleteCustomer", (id) => ({
  type: "customer.delete",
  payload: { id },
}));
export const toggleCustomer = thunk<number>("toggleCustomer", (id) => ({
  type: "customer.toggle",
  payload: { id },
}));
export const recordPurchase = thunk<Omit<Purchase, "id" | "ref" | "total">>(
  "recordPurchase",
  (p) => ({ type: "purchase.create", payload: p }),
);
export const updatePurchase = thunk<Purchase>("updatePurchase", (p) => ({
  type: "purchase.update",
  payload: p,
}));
export const deletePurchase = thunk<number>("deletePurchase", (id) => ({
  type: "purchase.delete",
  payload: { id },
}));
export const recordProduction = thunk<Omit<Production, "id" | "ref">>(
  "recordProduction",
  (p) => ({ type: "production.create", payload: p }),
);
export const updateProduction = thunk<Production>("updateProduction", (p) => ({
  type: "production.update",
  payload: p,
}));
export const deleteProduction = thunk<number>("deleteProduction", (id) => ({
  type: "production.delete",
  payload: { id },
}));
export const recordSale = thunk<{
  customerId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  payment: number;
  date: string;
}>("recordSale", (p) => ({ type: "sale.create", payload: p }));
export const updateSale = thunk<Sale>("updateSale", (p) => ({
  type: "sale.update",
  payload: p,
}));
export const deleteSale = thunk<number>("deleteSale", (id) => ({
  type: "sale.delete",
  payload: { id },
}));
export const recordPayment = thunk<{
  customerId: number;
  amount: number;
  date: string;
}>("recordPayment", (p) => ({ type: "payment.create", payload: p }));
export const updatePayment = thunk<Payment>("updatePayment", (p) => ({
  type: "payment.update",
  payload: p,
}));
export const deletePayment = thunk<number>("deletePayment", (id) => ({
  type: "payment.delete",
  payload: { id },
}));
export const recordReturn = thunk<Omit<ProductReturn, "id" | "ref" | "total">>(
  "recordReturn",
  (p) => ({ type: "return.create", payload: p }),
);
export const updateReturn = thunk<ProductReturn>("updateReturn", (p) => ({
  type: "return.update",
  payload: p,
}));
export const deleteReturn = thunk<number>("deleteReturn", (id) => ({
  type: "return.delete",
  payload: { id },
}));

const mutations = [
  addRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  toggleRawMaterial,
  addFinishedProduct,
  updateFinishedProduct,
  deleteFinishedProduct,
  toggleFinishedProduct,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  toggleCustomer,
  recordPurchase,
  updatePurchase,
  deletePurchase,
  recordProduction,
  updateProduction,
  deleteProduction,
  recordSale,
  updateSale,
  deleteSale,
  recordPayment,
  updatePayment,
  deletePayment,
  recordReturn,
  updateReturn,
  deleteReturn,
] as const;
const slice = createSlice({
  name: "inventory",
  initialState: emptyInventoryState(),
  reducers: {
    hydrateInventory: (_state, action: PayloadAction<InventoryState>) =>
      action.payload,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.fulfilled, (_s, a) => a.payload)
      .addMatcher(
        isAnyOf(...mutations.map((x) => x.fulfilled)),
        (_s, a) => a.payload,
      );
  },
});
export const { hydrateInventory } = slice.actions;
export default slice.reducer;
