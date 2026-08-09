import {
  createSlice,
  type PayloadAction,
  type UnknownAction,
} from "@reduxjs/toolkit";

interface ClientState {
  activeTab: string;
  pendingInventoryRequests: number;
}

const initialState: ClientState = {
  activeTab: "Dashboard",
  pendingInventoryRequests: 0,
};

const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action: UnknownAction) =>
          action.type.startsWith("inventory/") &&
          action.type.endsWith("/pending"),
        (state) => {
          state.pendingInventoryRequests += 1;
        },
      )
      .addMatcher(
        (action: UnknownAction) =>
          action.type.startsWith("inventory/") &&
          (action.type.endsWith("/fulfilled") ||
            action.type.endsWith("/rejected")),
        (state) => {
          state.pendingInventoryRequests = Math.max(
            0,
            state.pendingInventoryRequests - 1,
          );
        },
      );
  },
});

export const { setActiveTab } = clientSlice.actions;
export default clientSlice.reducer;
