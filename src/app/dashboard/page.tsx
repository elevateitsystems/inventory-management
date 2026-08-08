"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes, Menu } from "lucide-react";
import {
  useAppDispatch,
  useAppSelector,
  useInventoryBusy,
} from "@/store/hooks";
import { setActiveTab } from "@/store/slices/clientSlice";
import { fetchInventory } from "@/store/slices/inventorySlice";
import { getErrorMessage, getErrorStatus } from "@/lib/api";
import { ButtonSpinner, LoadingScreen } from "@/components/dashboard/DataUI";
import { useToast } from "@/components/ui/ToastProvider";
import Sidebar from "@/components/dashboard/Sidebar";
import CustomerLedgerTab from "@/components/dashboard/tabs/CustomerLedgerTab";
import DashboardTab from "@/components/dashboard/tabs/DashboardTab";
import ProductsTab from "@/components/dashboard/tabs/ProductsTab";
import ProductionTab from "@/components/dashboard/tabs/ProductionTab";
import PurchaseHistoryTab from "@/components/dashboard/tabs/PurchaseHistoryTab";
import RawMaterialsTab from "@/components/dashboard/tabs/RawMaterialsTab";
import ReportsTab from "@/components/dashboard/tabs/ReportsTab";
import SalesHistoryTab from "@/components/dashboard/tabs/SalesHistoryTab";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();
  const redirectPending = useRef(false);
  const inventoryBusy = useInventoryBusy();
  const activeTab = useAppSelector((state) => state.client.activeTab);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inventoryReady, setInventoryReady] = useState(false);
  const [loadError, setLoadError] = useState("");

  const handleLoadError = useCallback(
    (reason: unknown) => {
      if (getErrorStatus(reason) === 401) {
        if (!redirectPending.current) {
          redirectPending.current = true;
          toast("Please sign in to access the dashboard.", "error");
          window.setTimeout(() => router.push("/login"), 900);
        }
        return;
      }
      setLoadError(
        getErrorMessage(reason, "Inventory data could not be loaded."),
      );
    },
    [router, toast],
  );

  useEffect(() => {
    void dispatch(fetchInventory())
      .unwrap()
      .then(() => setInventoryReady(true))
      .catch(handleLoadError);
  }, [dispatch, handleLoadError]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const changeTab = (tab: string) => dispatch(setActiveTab(tab));
  const content = {
    Dashboard: <DashboardTab />,
    "Raw Materials": <RawMaterialsTab />,
    Purchases: <PurchaseHistoryTab />,
    Production: <ProductionTab />,
    "Finished Products": <ProductsTab />,
    Sales: <SalesHistoryTab />,
    "Customer Ledger": <CustomerLedgerTab />,
    Reports: <ReportsTab />,
  }[activeTab] ?? <DashboardTab />;

  if (!inventoryReady) {
    if (loadError)
      return (
        <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
          <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-rose-700">{loadError}</p>
            <button
              disabled={inventoryBusy}
              aria-busy={inventoryBusy}
              onClick={() => {
                setLoadError("");
                void dispatch(fetchInventory())
                  .unwrap()
                  .then(() => setInventoryReady(true))
                  .catch(handleLoadError);
              }}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {inventoryBusy && <ButtonSpinner />}
              {inventoryBusy ? "Trying again..." : "Try again"}
            </button>
          </div>
        </div>
      );
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-100/80 lg:flex">
      <Sidebar activeTab={activeTab} setActiveTab={changeTab} />

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white">
            <Boxes className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-400">
              StockFlow
            </p>
            <p className="truncate text-sm font-bold text-slate-900">
              {activeTab}
            </p>
          </div>
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm hover:bg-slate-50"
          aria-label="Open navigation"
          aria-expanded={menuOpen}
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {menuOpen && (
        <div className="lg:hidden">
          <button
            className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation overlay"
          />
          <Sidebar
            activeTab={activeTab}
            setActiveTab={changeTab}
            mobile
            onClose={() => setMenuOpen(false)}
          />
        </div>
      )}

      <main className="min-w-0 flex-1 overflow-x-hidden p-3.5 sm:p-6 lg:p-7 xl:p-8">
        {content}
      </main>
    </div>
  );
}
