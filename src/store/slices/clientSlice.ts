// store/slices/clientSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ClientState {
  // Navigation
  activeTab: string;
  
  // Client states
  searchTerm: string;
  selectedClient: any | null;
  
  // Dashboard states
  showAllTransactions: boolean;
  
  // Products states
  productSearchTerm: string;
  selectedProduct: any | null;
  
  // Purchase History states
  purchaseSearchTerm: string;
  
  // Sales History states
  salesSearchTerm: string;
  
  // Suppliers states
  supplierSearchTerm: string;
  selectedSupplier: any | null;
  
  // Reports states
  reportDate: string;
  reportMonth: string;
  reportYear: string;
}

const initialState: ClientState = {
  // Navigation
  activeTab: "Dashboard",
  
  // Client
  searchTerm: "",
  selectedClient: null,
  
  // Dashboard
  showAllTransactions: false,
  
  // Products
  productSearchTerm: "",
  selectedProduct: null,
  
  // Purchase History
  purchaseSearchTerm: "",
  
  // Sales History
  salesSearchTerm: "",
  
  // Suppliers
  supplierSearchTerm: "",
  selectedSupplier: null,
  
  // Reports
  reportDate: new Date().toISOString().split('T')[0],
  reportMonth: new Date().toISOString().slice(0, 7),
  reportYear: new Date().getFullYear().toString(),
};

const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    // Navigation reducer
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    
    // Client reducers
    setClientSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSelectedClient: (state, action: PayloadAction<any | null>) => {
      state.selectedClient = action.payload;
    },
    
    // Dashboard reducers
    toggleShowAllTransactions: (state) => {
      state.showAllTransactions = !state.showAllTransactions;
    },
    
    // Products reducers
    setProductSearchTerm: (state, action: PayloadAction<string>) => {
      state.productSearchTerm = action.payload;
    },
    setSelectedProduct: (state, action: PayloadAction<any | null>) => {
      state.selectedProduct = action.payload;
    },
    
    // Purchase History reducers
    setPurchaseSearchTerm: (state, action: PayloadAction<string>) => {
      state.purchaseSearchTerm = action.payload;
    },
    
    // Sales History reducers
    setSalesSearchTerm: (state, action: PayloadAction<string>) => {
      state.salesSearchTerm = action.payload;
    },
    
    // Suppliers reducers
    setSupplierSearchTerm: (state, action: PayloadAction<string>) => {
      state.supplierSearchTerm = action.payload;
    },
    setSelectedSupplier: (state, action: PayloadAction<any | null>) => {
      state.selectedSupplier = action.payload;
    },
    
    // Reports reducers
    setReportDate: (state, action: PayloadAction<string>) => {
      state.reportDate = action.payload;
    },
    setReportMonth: (state, action: PayloadAction<string>) => {
      state.reportMonth = action.payload;
    },
    setReportYear: (state, action: PayloadAction<string>) => {
      state.reportYear = action.payload;
    },
  },
});

export const {
  setActiveTab,
  setClientSearchTerm,
  setSelectedClient,
  toggleShowAllTransactions,
  setProductSearchTerm,
  setSelectedProduct,
  setPurchaseSearchTerm,
  setSalesSearchTerm,
  setSupplierSearchTerm,
  setSelectedSupplier,
  setReportDate,
  setReportMonth,
  setReportYear,
} = clientSlice.actions;

export default clientSlice.reducer;