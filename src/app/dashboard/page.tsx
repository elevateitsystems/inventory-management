
"use client";

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setActiveTab } from '@/store/slices/clientSlice';
import Sidebar from "@/components/dashboard/Sidebar";
import ClientsTab from "@/components/dashboard/tabs/ClientsTab";
import DashboardTab from "@/components/dashboard/tabs/DashboardTab";
import ProductsTab from "@/components/dashboard/tabs/ProductsTab";
import PurchaseHistoryTab from "@/components/dashboard/tabs/PurchaseHistoryTab";
import ReportsTab from "@/components/dashboard/tabs/ReportsTab";
import SalesHistoryTab from "@/components/dashboard/tabs/SalesHistoryTab";
import SettingsTab from "@/components/dashboard/tabs/SettingsTab";
import SuppliersTab from "@/components/dashboard/tabs/SuppliersTab";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  
  // Get activeTab from Redux instead of useState
  const activeTab = useAppSelector((state) => state.client.activeTab);

  const renderTab = () => {
    switch (activeTab) {
      case "Dashboard":
        return <DashboardTab />;
      case "Clients":
        return <ClientsTab />;
      case "Suppliers":
        return <SuppliersTab />;
      case "Products":
        return <ProductsTab />;
      case "Purchase History":
        return <PurchaseHistoryTab />;
      case "Sales History":
        return <SalesHistoryTab />;
      case "Reports":
        return <ReportsTab />;
      case "Settings":
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  // Handler - dispatch action instead of setState
  const handleTabChange = (tab: string) => {
    dispatch(setActiveTab(tab));
  };

  return (
    <div className="flex min-h-screen bg-[#f0f2f5]">
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
      <main className="flex-1 p-6 overflow-y-auto">{renderTab()}</main>
    </div>
  );
}