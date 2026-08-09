"use client";

import { Boxes, Download, LoaderCircle } from "lucide-react";
import { useState } from "react";
import type { Customer, FinishedProduct, Sale } from "@/types/inventory";
import { formatCurrency } from "@/lib/inventory";
import Modal, { primaryButtonClass, secondaryButtonClass } from "./Modal";

type InvoiceRecord = Pick<
  Sale,
  "ref" | "quantity" | "unitPrice" | "total" | "date"
>;
type InvoiceParty = Pick<Customer, "name"> &
  Partial<Pick<Customer, "phone" | "email">>;
type InvoiceItem = Pick<FinishedProduct, "name" | "sku">;

interface InvoiceOptions {
  documentTitle?: string;
  partyLabel?: string;
  filenamePrefix?: string;
  downloadLabel?: string;
}

export default function SalesInvoiceModal({
  sale,
  customer,
  product,
  onClose,
  documentTitle = "Invoice",
  partyLabel = "Invoice to",
  filenamePrefix = "invoice",
  downloadLabel = "Download Invoice",
}: {
  sale: InvoiceRecord;
  customer?: InvoiceParty;
  product?: InvoiceItem;
  onClose: () => void;
} & InvoiceOptions) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const invoiceDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(sale.date));

  return (
    <Modal
      title={`${documentTitle} ${sale.ref}`}
      description="Review the invoice details before downloading the PDF."
      onClose={onClose}
      wide
    >
      <article
        className="overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900"
        aria-label={`${documentTitle} ${sale.ref}`}
      >
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
          <h2 className="text-2xl font-light uppercase tracking-tight sm:text-3xl">
            {documentTitle}
          </h2>
        </div>

        <div className="h-2 bg-indigo-600" />

        <div className="grid gap-5 px-5 py-6 sm:grid-cols-[1fr_auto] sm:px-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {partyLabel}
            </p>
            <p className="mt-2 text-sm font-bold text-slate-950">
              {customer?.name ?? "Customer"}
            </p>
            {customer?.phone && (
              <p className="mt-1 text-xs text-slate-500">{customer.phone}</p>
            )}
            {customer?.email && (
              <p className="text-xs text-slate-500">{customer.email}</p>
            )}
          </div>
          <dl className="grid grid-cols-[auto_auto] content-start gap-x-5 gap-y-1 text-xs">
            <dt className="font-semibold text-slate-500">Invoice #</dt>
            <dd className="text-right font-bold text-slate-900">{sale.ref}</dd>
            <dt className="font-semibold text-slate-500">Date</dt>
            <dd className="text-right text-slate-700">{invoiceDate}</dd>
          </dl>
        </div>

        <div className="px-5 sm:px-7">
          <div className="overflow-hidden rounded-sm border border-slate-300">
            <table className="w-full table-fixed text-left text-[10px] sm:text-xs">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="w-10 px-2 py-3 text-center font-semibold">
                    #
                  </th>
                  <th className="px-2 py-3 font-semibold">Item description</th>
                  <th className="w-[23%] px-2 py-3 text-right font-semibold">
                    Price
                  </th>
                  <th className="w-[14%] px-2 py-3 text-right font-semibold">
                    Qty.
                  </th>
                  <th className="w-[24%] px-2 py-3 text-right font-semibold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="align-top">
                  <td className="px-2 py-4 text-center text-slate-500">1</td>
                  <td className="px-2 py-4">
                    <p className="font-semibold text-slate-900">
                      {product?.name ?? "Finished product"}
                    </p>
                    {product?.sku && (
                      <p className="mt-1 text-[9px] uppercase tracking-wide text-slate-400">
                        SKU: {product.sku}
                      </p>
                    )}
                  </td>
                  <td className="px-2 py-4 text-right text-slate-600">
                    {formatCurrency(sale.unitPrice)}
                  </td>
                  <td className="px-2 py-4 text-right text-slate-600">
                    {sale.quantity}
                  </td>
                  <td className="px-2 py-4 text-right font-bold text-slate-900">
                    {formatCurrency(sale.total)}
                  </td>
                </tr>
                <tr aria-hidden="true">
                  <td colSpan={5} className="h-24 sm:h-32" />
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-6 px-5 py-6 sm:grid-cols-[1fr_220px] sm:px-7">
          <div>
            <p className="text-xs font-bold">Thank you for your business.</p>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Terms &amp; conditions
            </p>
            <p className="mt-1 max-w-sm text-[10px] leading-relaxed text-slate-400">
              Please retain this invoice for your records and reference the
              invoice number with any enquiry.
            </p>
          </div>
          <dl className="text-xs">
            <div className="flex justify-between gap-4 px-3 py-2">
              <dt className="font-semibold text-slate-500">Subtotal</dt>
              <dd className="font-bold text-slate-900">
                {formatCurrency(sale.total)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 bg-indigo-600 px-3 py-3 text-sm text-white">
              <dt className="font-bold">Total</dt>
              <dd className="font-black">{formatCurrency(sale.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-5 px-5 pb-6 sm:grid-cols-[1fr_180px] sm:px-7">
          <div />
          <div className="border-t border-slate-800 pt-2 text-center text-[10px] font-semibold text-slate-500">
            Authorised signature
          </div>
        </div>

        <footer className="flex flex-col justify-between gap-1 border-t-2 border-indigo-600 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400 sm:flex-row sm:px-7">
          <span>StockFlow</span>
          <span>Inventory Management System</span>
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
              await downloadInvoicePdf(sale, customer, product, {
                documentTitle,
                partyLabel,
                filenamePrefix,
              });
            } catch {
              setDownloadError(
                "The invoice PDF could not be downloaded. Please try again.",
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
          {downloading ? "Preparing PDF..." : downloadLabel}
        </button>
      </div>
    </Modal>
  );
}

export async function downloadInvoicePdf(
  sale: InvoiceRecord,
  customer?: InvoiceParty,
  product?: InvoiceItem,
  {
    documentTitle = "Invoice",
    partyLabel = "Invoice to",
    filenamePrefix = "invoice",
  }: InvoiceOptions = {},
) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const primary = [79, 70, 229] as const;
  const dark = [15, 23, 42] as const;
  const muted = [100, 116, 139] as const;
  const light = [226, 232, 240] as const;
  const invoiceDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(sale.date));

  pdf.setFillColor(...dark);
  pdf.roundedRect(margin, 15, 12, 12, 2, 2, "F");
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.6);
  pdf.rect(margin + 2.5, 18, 3, 3);
  pdf.rect(margin + 6.5, 21, 3, 3);

  pdf.setTextColor(...dark);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("StockFlow", margin + 16, 21);
  pdf.setTextColor(...muted);
  pdf.setFontSize(6.5);
  pdf.text("INVENTORY MANAGEMENT", margin + 16, 25);

  pdf.setTextColor(...dark);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(documentTitle.length > 10 ? 19 : 25);
  pdf.text(documentTitle.toUpperCase(), pageWidth - margin, 24, {
    align: "right",
  });

  pdf.setFillColor(...primary);
  pdf.rect(0, 34, pageWidth, 3.5, "F");

  pdf.setTextColor(...muted);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text(partyLabel.toUpperCase(), margin, 48);
  pdf.setTextColor(...dark);
  pdf.setFontSize(10);
  pdf.text(customer?.name || "Customer", margin, 54);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...muted);
  pdf.setFontSize(8);
  let customerY = 59;
  if (customer?.phone) {
    pdf.text(customer.phone, margin, customerY);
    customerY += 4.5;
  }
  if (customer?.email) pdf.text(customer.email, margin, customerY);

  const detailsX = pageWidth - margin - 54;
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...muted);
  pdf.text("Invoice #", detailsX, 50);
  pdf.text("Date", detailsX, 56);
  pdf.setTextColor(...dark);
  pdf.text(sale.ref, pageWidth - margin, 50, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.text(invoiceDate, pageWidth - margin, 56, { align: "right" });

  const tableY = 75;
  const columns = [12, 72, 32, 24, 38];
  const positions = [margin];
  columns.forEach((width) => positions.push(positions.at(-1)! + width));
  pdf.setFillColor(...dark);
  pdf.rect(margin, tableY, contentWidth, 10, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.text("#", positions[0] + columns[0] / 2, tableY + 6.5, {
    align: "center",
  });
  pdf.text("Item description", positions[1] + 2.5, tableY + 6.5);
  pdf.text("Price", positions[3] - 2.5, tableY + 6.5, { align: "right" });
  pdf.text("Qty.", positions[4] - 2.5, tableY + 6.5, { align: "right" });
  pdf.text("Total", positions[5] - 2.5, tableY + 6.5, { align: "right" });

  pdf.setDrawColor(...light);
  pdf.setLineWidth(0.35);
  pdf.rect(margin, tableY + 10, contentWidth, 67);
  pdf.setTextColor(...muted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text("1", positions[0] + columns[0] / 2, tableY + 20, {
    align: "center",
  });
  pdf.setTextColor(...dark);
  pdf.setFont("helvetica", "bold");
  const productName = product?.name || "Finished product";
  pdf.text(
    pdf.splitTextToSize(productName, columns[1] - 6),
    positions[1] + 2.5,
    tableY + 19,
  );
  if (product?.sku) {
    pdf.setTextColor(...muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    pdf.text(`SKU: ${product.sku}`, positions[1] + 2.5, tableY + 25);
  }
  pdf.setFontSize(8);
  pdf.setTextColor(...muted);
  pdf.text(formatCurrency(sale.unitPrice), positions[3] - 2.5, tableY + 20, {
    align: "right",
  });
  pdf.text(String(sale.quantity), positions[4] - 2.5, tableY + 20, {
    align: "right",
  });
  pdf.setTextColor(...dark);
  pdf.setFont("helvetica", "bold");
  pdf.text(formatCurrency(sale.total), positions[5] - 2.5, tableY + 20, {
    align: "right",
  });

  pdf.setFontSize(8.5);
  pdf.text("Thank you for your business.", margin, 163);
  pdf.setFontSize(6.5);
  pdf.setTextColor(...muted);
  pdf.text("TERMS & CONDITIONS", margin, 171);
  pdf.setFont("helvetica", "normal");
  const terms =
    "Please retain this invoice for your records and reference the invoice number with any enquiry.";
  pdf.text(pdf.splitTextToSize(terms, 88), margin, 176);

  const totalsX = pageWidth - margin - 58;
  pdf.setFontSize(8);
  pdf.setTextColor(...muted);
  pdf.setFont("helvetica", "bold");
  pdf.text("Subtotal", totalsX + 3, 161);
  pdf.setTextColor(...dark);
  pdf.text(formatCurrency(sale.total), pageWidth - margin - 3, 161, {
    align: "right",
  });
  pdf.setFillColor(...primary);
  pdf.rect(totalsX, 166, 58, 12, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.text("Total", totalsX + 3, 173.5);
  pdf.text(formatCurrency(sale.total), pageWidth - margin - 3, 173.5, {
    align: "right",
  });

  pdf.setDrawColor(...dark);
  pdf.line(pageWidth - margin - 52, 210, pageWidth - margin, 210);
  pdf.setTextColor(...muted);
  pdf.setFontSize(6.5);
  pdf.text("AUTHORISED SIGNATURE", pageWidth - margin - 26, 215, {
    align: "center",
  });

  pdf.setDrawColor(...primary);
  pdf.setLineWidth(0.8);
  pdf.line(margin, 272, pageWidth - margin, 272);
  pdf.setTextColor(...muted);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.text("STOCKFLOW", margin, 279);
  pdf.text("INVENTORY MANAGEMENT SYSTEM", pageWidth - margin, 279, {
    align: "right",
  });

  pdf.save(`${filenamePrefix}-${sale.ref}.pdf`);
}
