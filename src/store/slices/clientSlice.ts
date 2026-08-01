import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ClientState { activeTab: string; }

const initialState: ClientState = { activeTab: "Dashboard" };

const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<string>) => { state.activeTab = action.payload; },
  },
});

export const { setActiveTab } = clientSlice.actions;
export default clientSlice.reducer;
