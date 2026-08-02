"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveTab } from "@/store/slices/clientSlice";
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
  const activeTab = useAppSelector((state) => state.client.activeTab);
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

  return <div className="flex min-h-screen bg-slate-100/80"><Sidebar activeTab={activeTab} setActiveTab={(tab) => dispatch(setActiveTab(tab))} /><main className="min-w-0 flex-1 p-5 sm:p-7 lg:p-8">{content}</main></div>;
}
