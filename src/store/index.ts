
import { configureStore } from "@reduxjs/toolkit";
import clientReducer from "./slices/clientSlice";
import inventoryReducer from "./slices/inventorySlice";

export const store = configureStore({
  reducer: {
    client: clientReducer,
    inventory: inventoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
