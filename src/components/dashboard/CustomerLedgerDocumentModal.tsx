"use client";

import { Boxes, Download, LoaderCircle } from "lucide-react";
import { useState } from "react";
import type { Customer, LedgerEntry } from "@/types/inventory";
import { formatCurrency, formatDateTime } from "@/lib/inventory";
import Modal, { primaryButtonClass, secondaryButtonClass } from "./Modal";

export default function CustomerLedgerDocumentModal({
  customer,
  entries,
  onClose,
}: {
  customer: Customer;
  entries: LedgerEntry[];
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const orderedEntries = [...entries].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);
  const balance = totalDebit - totalCredit;
  let runningBalance = 0;

  return (
    <Modal
      title={`${customer.name} Ledger`}
      description="Review the complete customer statement before downloading the PDF."
      onClose={onClose}
      wide
    >
      <article className="overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900">
        <div className="flex items-start justify-between gap-4 px-5 pb-5 pt-6 sm:px-7 sm:pt-7">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white">
              <Boxes className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">StockFlow</p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Inventory Management
              </p>
            </div>
          </div>
          <h2 className="text-right text-xl font-light uppercase tracking-tight sm:text-2xl">
            Customer Ledger
          </h2>
        </div>

        <div className="h-2 bg-indigo-600" />

        <div className="grid gap-5 px-5 py-6 sm:grid-cols-[1fr_auto] sm:px-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Customer
            </p>
            <p className="mt-2 text-sm font-bold text-slate-950">
              {customer.name}
            </p>
            <p className="mt-1 text-xs text-slate-500">{customer.phone}</p>
            <p className="text-xs text-slate-500">{customer.email}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Current balance
            </p>
            <p
              className={`mt-2 text-xl font-black ${balance > 0 ? "text-rose-600" : "text-emerald-600"}`}
            >
              {formatCurrency(balance)}
            </p>
            <p className="text-[10px] text-slate-400">
              {entries.length} transaction{entries.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 px-5 pb-5 sm:gap-3 sm:px-7">
          <Summary label="Total debit" value={formatCurrency(totalDebit)} />
          <Summary label="Total credit" value={formatCurrency(totalCredit)} />
          <Summary
            label="Balance due"
            value={formatCurrency(balance)}
            danger={balance > 0}
          />
        </div>

        <div className="px-5 sm:px-7">
          <div className="max-h-80 overflow-auto rounded-sm border border-slate-300">
            <table className="w-full min-w-[620px] text-left text-[10px] sm:text-xs">
              <thead className="sticky top-0 bg-slate-900 text-white">
                <tr>
                  <th className="px-2 py-3 font-semibold">Date</th>
                  <th className="px-2 py-3 font-semibold">Type</th>
                  <th className="px-2 py-3 font-semibold">Reference</th>
                  <th className="px-2 py-3 font-semibold">Details</th>
                  <th className="px-2 py-3 text-right font-semibold">Debit</th>
                  <th className="px-2 py-3 text-right font-semibold">Credit</th>
                  <th className="px-2 py-3 text-right font-semibold">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orderedEntries.map((entry) => {
                  runningBalance += entry.debit - entry.credit;
                  return (
                    <tr key={entry.id}>
                      <td className="whitespace-nowrap px-2 py-3 text-slate-500">
                        {formatDateTime(entry.date)}
                      </td>
                      <td className="px-2 py-3 font-semibold">{entry.type}</td>
                      <td className="px-2 py-3 text-indigo-600">{entry.ref}</td>
                      <td className="max-w-40 px-2 py-3 text-slate-500">
                        {entry.note}
                      </td>
                      <td className="px-2 py-3 text-right">
                        {entry.debit ? formatCurrency(entry.debit) : "—"}
                      </td>
                      <td className="px-2 py-3 text-right text-emerald-600">
                        {entry.credit ? formatCurrency(entry.credit) : "—"}
                      </td>
                      <td className="px-2 py-3 text-right font-bold">
                        {formatCurrency(runningBalance)}
                      </td>
                    </tr>
                  );
                })}
                {!orderedEntries.length && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-12 text-center text-slate-400"
                    >
                      No ledger entries for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-5 px-5 py-7 sm:grid-cols-[1fr_180px] sm:px-7">
          <p className="text-[10px] leading-relaxed text-slate-400">
            Balance is calculated as total debit minus total credit from the
            complete saved ledger history.
          </p>
          <div className="border-t border-slate-800 pt-2 text-center text-[10px] font-semibold text-slate-500">
            Authorised signature
          </div>
        </div>

        <footer className="flex flex-col justify-between gap-1 border-t-2 border-indigo-600 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400 sm:flex-row sm:px-7">
          <span>StockFlow</span>
          <span>Customer Account Statement</span>
        </footer>
      </article>

      {downloadError && (
        <p role="alert" className="mt-4 text-sm text-rose-600">
          {downloadError}
        </p>
      )}
      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={downloading}
          onClick={onClose}
          className={secondaryButtonClass}
        >
          Close
        </button>
        <button
          type="button"
          disabled={downloading}
          aria-busy={downloading}
          onClick={async () => {
            setDownloading(true);
            setDownloadError("");
            try {
              await downloadCustomerLedgerPdf(customer, entries);
            } catch {
              setDownloadError(
                "The ledger PDF could not be downloaded. Please try again.",
              );
            } finally {
              setDownloading(false);
            }
          }}
          className={primaryButtonClass}
        >
          {downloading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {downloading ? "Preparing PDF..." : "Download Statement"}
        </button>
      </div>
    </Modal>
  );
}

function Summary({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 p-2.5 sm:p-3">
      <p className="truncate text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 truncate text-xs font-black sm:text-sm ${danger ? "text-rose-600" : "text-slate-900"}`}
      >
        {value}
      </p>
    </div>
  );
}

export async function downloadCustomerLedgerPdf(
  customer: Customer,
  entries: LedgerEntry[],
) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = 14;
  const primary = [79, 70, 229] as const;
  const dark = [15, 23, 42] as const;
  const muted = [100, 116, 139] as const;
  const light = [226, 232, 240] as const;
  const ordered = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);
  const balance = totalDebit - totalCredit;
  let page = 1;
  let running = 0;

  const drawPageHeader = () => {
    pdf.setFillColor(...dark);
    pdf.roundedRect(margin, 10, 10, 10, 2, 2, "F");
    pdf.setTextColor(...dark);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("StockFlow", margin + 14, 16);
    pdf.setTextColor(...muted);
    pdf.setFontSize(6);
    pdf.text("INVENTORY MANAGEMENT", margin + 14, 20);
    pdf.setTextColor(...dark);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(19);
    pdf.text("CUSTOMER LEDGER", width - margin, 18, { align: "right" });
    pdf.setFillColor(...primary);
    pdf.rect(0, 27, width, 3, "F");
  };

  const columns = [31, 24, 28, 70, 28, 28, 32];
  const positions = [margin];
  columns.forEach((column) => positions.push(positions.at(-1)! + column));
  const drawTableHeader = (y: number) => {
    pdf.setFillColor(...dark);
    pdf.rect(
      margin,
      y,
      columns.reduce((sum, column) => sum + column, 0),
      9,
      "F",
    );
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.8);
    ["Date", "Type", "Reference", "Details"].forEach((label, index) =>
      pdf.text(label, positions[index] + 2, y + 6),
    );
    ["Debit", "Credit", "Balance"].forEach((label, index) =>
      pdf.text(label, positions[index + 5] - 2, y + 6, { align: "right" }),
    );
  };
  const drawFooter = () => {
    pdf.setDrawColor(...primary);
    pdf.setLineWidth(0.7);
    pdf.line(margin, height - 12, width - margin, height - 12);
    pdf.setTextColor(...muted);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6);
    pdf.text("STOCKFLOW · CUSTOMER ACCOUNT STATEMENT", margin, height - 7);
    pdf.text(`PAGE ${page}`, width - margin, height - 7, { align: "right" });
  };

  drawPageHeader();
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...muted);
  pdf.setFontSize(6.5);
  pdf.text("CUSTOMER", margin, 40);
  pdf.setTextColor(...dark);
  pdf.setFontSize(10);
  pdf.text(customer.name, margin, 47);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...muted);
  pdf.setFontSize(7);
  pdf.text(`${customer.phone} · ${customer.email}`, margin, 52);
  pdf.setFont("helvetica", "bold");
  pdf.text("TOTAL DEBIT", 155, 40);
  pdf.text("TOTAL CREDIT", 198, 40);
  pdf.text("BALANCE DUE", 241, 40);
  pdf.setTextColor(...dark);
  pdf.setFontSize(10);
  pdf.text(formatCurrency(totalDebit), 155, 47);
  pdf.text(formatCurrency(totalCredit), 198, 47);
  pdf.setTextColor(
    balance > 0 ? 225 : 5,
    balance > 0 ? 29 : 150,
    balance > 0 ? 72 : 105,
  );
  pdf.text(formatCurrency(balance), 241, 47);

  let y = 61;
  drawTableHeader(y);
  y += 9;
  pdf.setDrawColor(...light);
  pdf.setLineWidth(0.25);
  ordered.forEach((entry) => {
    running += entry.debit - entry.credit;
    const details = pdf.splitTextToSize(entry.note || "-", columns[3] - 4);
    const rowHeight = Math.max(9, details.length * 3.5 + 3);
    if (y + rowHeight > height - 17) {
      drawFooter();
      pdf.addPage();
      page += 1;
      drawPageHeader();
      y = 38;
      drawTableHeader(y);
      y += 9;
    }
    pdf.setTextColor(...muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    const date = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(entry.date));
    pdf.text(date, positions[0] + 2, y + 5.5);
    pdf.setTextColor(...dark);
    pdf.setFont("helvetica", "bold");
    pdf.text(entry.type, positions[1] + 2, y + 5.5);
    pdf.setTextColor(...primary);
    pdf.text(entry.ref, positions[2] + 2, y + 5.5);
    pdf.setTextColor(...muted);
    pdf.setFont("helvetica", "normal");
    pdf.text(details, positions[3] + 2, y + 4.5);
    pdf.setTextColor(...dark);
    pdf.text(
      entry.debit ? formatCurrency(entry.debit) : "-",
      positions[5] - 2,
      y + 5.5,
      { align: "right" },
    );
    pdf.setTextColor(5, 150, 105);
    pdf.text(
      entry.credit ? formatCurrency(entry.credit) : "-",
      positions[6] - 2,
      y + 5.5,
      { align: "right" },
    );
    pdf.setTextColor(...dark);
    pdf.setFont("helvetica", "bold");
    pdf.text(formatCurrency(running), positions[7] - 2, y + 5.5, {
      align: "right",
    });
    pdf.line(margin, y + rowHeight, positions[7], y + rowHeight);
    y += rowHeight;
  });
  if (!ordered.length) {
    pdf.setTextColor(...muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text("No ledger entries for this customer.", margin + 3, y + 12);
  }
  drawFooter();
  pdf.save(
    `customer-statement-${
      customer.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || customer.id
    }.pdf`,
  );
}
