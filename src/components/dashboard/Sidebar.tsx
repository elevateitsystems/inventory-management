"use client";

import { useState } from "react";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  Factory,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  ReceiptText,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { ButtonSpinner } from "@/components/dashboard/DataUI";
import {
  reportItems,
  type ReportId,
} from "@/components/dashboard/reportNavigation";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeReport: ReportId;
  setActiveReport: (report: ReportId) => void;
  mobile?: boolean;
  onClose?: () => void;
}

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Raw Materials", icon: Boxes },
  { name: "Purchases", icon: ShoppingCart },
  { name: "Production", icon: Factory },
  { name: "Finished Products", icon: PackageCheck },
  { name: "Sales", icon: ReceiptText },
  { name: "Customer Ledger", icon: Users },
  { name: "Reports", icon: BarChart3 },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeReport,
  setActiveReport,
  mobile = false,
  onClose,
}: SidebarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(activeTab === "Reports");
  const navigate = (tab: string) => {
    setActiveTab(tab);
    setReportsOpen(false);
    onClose?.();
  };
  const selectReport = (report: ReportId) => {
    setActiveReport(report);
    setActiveTab("Reports");
    onClose?.();
  };
  const reportsMenuId = `reports-submenu-${mobile ? "mobile" : "desktop"}`;

  return (
    <aside
      aria-label="Main navigation"
      className={`${
        mobile
          ? "fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(86vw,280px)] shadow-2xl"
          : "sticky top-0 hidden h-screen w-[252px] shrink-0 lg:flex"
      } flex-col border-r border-slate-800 bg-slate-950 text-white`}
    >
      <div className="flex h-[68px] shrink-0 items-center gap-3 border-b border-white/10 px-4 sm:h-[76px] sm:px-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20">
          <Boxes className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold tracking-tight">StockFlow</p>
          <p className="truncate text-[11px] text-slate-400">
            Inventory Management
          </p>
        </div>
        {mobile && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:py-5">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Operations
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.name;

            if (item.name === "Reports") {
              return (
                <div key={item.name}>
                  <button
                    type="button"
                    onClick={() => {
                      const opening = !reportsOpen;
                      setReportsOpen(opening);
                      if (opening) setActiveTab("Reports");
                    }}
                    aria-current={isActive ? "page" : undefined}
                    aria-expanded={reportsOpen}
                    aria-controls={reportsMenuId}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/20"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{item.name}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${reportsOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {reportsOpen && (
                    <div
                      id={reportsMenuId}
                      className="mt-1 space-y-1 border-l border-white/10 py-1 pl-3 ml-5"
                    >
                      {reportItems.map((report) => {
                        const reportActive =
                          isActive && activeReport === report.id;
                        return (
                          <button
                            key={report.id}
                            type="button"
                            onClick={() => selectReport(report.id)}
                            aria-current={reportActive ? "page" : undefined}
                            aria-controls="report-panel"
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                              reportActive
                                ? "bg-indigo-400/15 text-indigo-200"
                                : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${reportActive ? "bg-indigo-300" : "bg-slate-600"}`}
                              aria-hidden="true"
                            />
                            <span>{report.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => navigate(item.name)}
                aria-current={isActive ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="shrink-0 border-t border-white/10 p-3 sm:p-4">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs font-semibold text-white">Inventory Admin</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            All operational records saved
          </p>
          <div className="mt-3 flex border-t border-white/10 pt-2">
            <button
              disabled={loggingOut}
              aria-busy={loggingOut}
              onClick={async () => {
                if (loggingOut) return;
                setLoggingOut(true);
                try {
                  await apiRequest("/api/auth/logout", { method: "POST" });
                } finally {
                  router.push("/login");
                  router.refresh();
                }
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] text-slate-400 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? (
                <ButtonSpinner />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
