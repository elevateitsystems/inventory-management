export const reportItems = [
  { id: "daily-transactions", label: "Daily Transactions" },
  { id: "daily-stock-movement", label: "Daily Stock Movement" },
  { id: "monthly-report", label: "Monthly Report" },
  { id: "inventory-report", label: "Inventory Report" },
] as const;

export type ReportId = (typeof reportItems)[number]["id"];
