import type { LedgerEntry } from "@/store/slices/inventorySlice";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));

export const getCustomerDue = (ledger: LedgerEntry[], customerId: number) =>
  ledger
    .filter((entry) => entry.customerId === customerId)
    .reduce((due, entry) => due + entry.debit - entry.credit, 0);

export const getDateKey = (value: string) => value.slice(0, 10);

export const getMonthKey = (value: string) => value.slice(0, 7);

export const nowIso = () => new Date().toISOString();
