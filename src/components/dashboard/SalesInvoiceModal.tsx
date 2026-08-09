"use client";

import { Boxes, Printer } from "lucide-react";
import { useEffect } from "react";
import type { Customer, FinishedProduct, Sale } from "@/types/inventory";
import { formatCurrency } from "@/lib/inventory";
import Modal, { primaryButtonClass, secondaryButtonClass } from "./Modal";

export default function SalesInvoiceModal({
  sale,
  customer,
  product,
  onClose,
}: {
  sale: Sale;
  customer?: Customer;
  product?: FinishedProduct;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.classList.add("invoice-printing-enabled");
    return () => document.body.classList.remove("invoice-printing-enabled");
  }, []);

  const invoiceDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(sale.date));

  return (
    <Modal
      title={`Invoice ${sale.ref}`}
      description="Review the invoice details before printing or saving as PDF."
      onClose={onClose}
      wide
    >
      <article
        className="invoice-print-area overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900"
        aria-label={`Sales invoice ${sale.ref}`}
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
            Invoice
          </h2>
        </div>

        <div className="h-2 bg-indigo-600" />

        <div className="grid gap-5 px-5 py-6 sm:grid-cols-[1fr_auto] sm:px-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Invoice to
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

      <div className="invoice-no-print mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className={secondaryButtonClass}
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className={primaryButtonClass}
        >
          <Printer className="h-4 w-4" />
          Print / Save PDF
        </button>
      </div>
    </Modal>
  );
}
