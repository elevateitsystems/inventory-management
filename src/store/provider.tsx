
'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '.';
import { hydrateInventory, type InventoryState } from './slices/inventorySlice';

const STORAGE_KEY = 'inventory-management-state-v1';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const savedState = window.localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState) as InventoryState;
        if (Array.isArray(parsedState.rawMaterials) && Array.isArray(parsedState.transactions)) {
          store.dispatch(hydrateInventory(parsedState));
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    return store.subscribe(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState().inventory));
    });
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
