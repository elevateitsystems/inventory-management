import type { LedgerEntry } from "@/types/inventory";

export function findCreatedRecord<T extends { id: number }>(
  before: T[],
  after: T[],
) {
  const existingIds = new Set(before.map((item) => item.id));
  return after.find((item) => !existingIds.has(item.id));
}

export function pageContainingRecord<T extends { id: number }>(
  rows: T[],
  id: number,
  pageSize: number,
) {
  const index = rows.findIndex((item) => item.id === id);
  return index < 0 ? 1 : Math.floor(index / pageSize) + 1;
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value,
  );

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

export const getCustomerDue = (ledger: LedgerEntry[], customerId: number) =>
  ledger
    .filter((entry) => entry.customerId === customerId)
    .reduce((due, entry) => due + entry.debit - entry.credit, 0);

export const getDateKey = (value: string) => value.slice(0, 10);

export const getMonthKey = (value: string) => value.slice(0, 7);

export const nowIso = () => new Date().toISOString();
