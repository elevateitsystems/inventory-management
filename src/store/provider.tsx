"use client";

import { Provider } from "react-redux";
import { store } from ".";
import { ToastProvider } from "@/components/ui/ToastProvider";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ToastProvider>{children}</ToastProvider>
    </Provider>
  );
}
