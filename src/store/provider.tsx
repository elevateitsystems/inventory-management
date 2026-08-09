
'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '.';
import { hydrateInventory, type InventoryState } from './slices/inventorySlice';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { LoadingScreen } from '@/components/dashboard/DataUI';

const STORAGE_KEY = 'inventory-management-state-v2';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const savedState = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem('inventory-management-state-v1');
      if (savedState) {
        const parsedState = JSON.parse(savedState) as InventoryState;
        if (Array.isArray(parsedState.rawMaterials) && Array.isArray(parsedState.transactions)) {
          store.dispatch(hydrateInventory(parsedState));
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    queueMicrotask(() => setReady(true));

    return store.subscribe(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState().inventory));
    });
  }, []);

  return <Provider store={store}><ToastProvider>{ready ? children : <LoadingScreen />}</ToastProvider></Provider>;
}
