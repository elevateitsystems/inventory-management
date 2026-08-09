"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  Download,
  Factory,
  LoaderCircle,
} from "lucide-react";
import { useState } from "react";
import type {
  FinishedProduct,
  Production,
  RawMaterial,
} from "@/types/inventory";
import { formatDateTime } from "@/lib/inventory";
import Modal, { primaryButtonClass, secondaryButtonClass } from "./Modal";

export default function ProductionDocumentModal({
  production,
  material,
  product,
  onClose,
}: {
  production: Production;
  material?: RawMaterial;
  product?: FinishedProduct;
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  return (
    <Modal
      title={`Production Report ${production.ref}`}
      description="Review the production record before downloading the PDF."
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
            Production Report
          </h2>
        </div>

        <div className="h-2 bg-indigo-600" />

        <div className="grid gap-5 px-5 py-6 sm:grid-cols-[1fr_auto] sm:px-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Batch reference
            </p>
            <p className="mt-2 text-sm font-bold text-slate-950">
              {production.ref}
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              <Factory className="h-3 w-3" /> Completed
            </p>
          </div>
          <dl className="grid grid-cols-[auto_auto] content-start gap-x-5 gap-y-1 text-xs">
            <dt className="font-semibold text-slate-500">Batch #</dt>
            <dd className="text-right font-bold text-slate-900">
              {production.ref}
            </dd>
            <dt className="font-semibold text-slate-500">Date</dt>
            <dd className="text-right text-slate-700">
              {formatDateTime(production.date)}
            </dd>
          </dl>
        </div>

        <div className="px-5 sm:px-7">
          <div className="overflow-hidden rounded-sm border border-slate-300">
            <table className="w-full table-fixed text-left text-[10px] sm:text-xs">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="w-[24%] px-3 py-3 font-semibold">Movement</th>
                  <th className="px-3 py-3 font-semibold">Item</th>
                  <th className="w-[22%] px-3 py-3 font-semibold">SKU</th>
                  <th className="w-[22%] px-3 py-3 text-right font-semibold">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-3 py-4">
                    <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                      <ArrowUpFromLine className="h-3.5 w-3.5" /> Stock OUT
                    </span>
                  </td>
                  <td className="px-3 py-4 font-semibold text-slate-900">
                    {material?.name ?? "Raw material"}
                  </td>
                  <td className="px-3 py-4 text-slate-500">
                    {material?.sku ?? "—"}
                  </td>
                  <td className="px-3 py-4 text-right font-bold text-rose-600">
                    -{production.materialQuantity} {material?.unit}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-4">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                      <ArrowDownToLine className="h-3.5 w-3.5" /> Stock IN
                    </span>
                  </td>
                  <td className="px-3 py-4 font-semibold text-slate-900">
                    {product?.name ?? "Finished product"}
                  </td>
                  <td className="px-3 py-4 text-slate-500">
                    {product?.sku ?? "—"}
                  </td>
                  <td className="px-3 py-4 text-right font-bold text-emerald-600">
                    +{production.productQuantity} {product?.unit}
                  </td>
                </tr>
                <tr aria-hidden="true">
                  <td colSpan={4} className="h-16 sm:h-24" />
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-3 px-5 py-6 sm:grid-cols-2 sm:px-7">
          <div className="rounded-lg bg-rose-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-rose-500">
              Material consumed
            </p>
            <p className="mt-1 text-lg font-black text-rose-700">
              {production.materialQuantity} {material?.unit}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500">
              Finished output
            </p>
            <p className="mt-1 text-lg font-black text-emerald-700">
              {production.productQuantity} {product?.unit}
            </p>
          </div>
        </div>

        <div className="grid gap-5 px-5 pb-7 sm:grid-cols-[1fr_180px] sm:px-7">
          <p className="text-[10px] leading-relaxed text-slate-400">
            This document was generated from the saved production and linked
            stock movement history.
          </p>
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
              await downloadProductionPdf(production, material, product);
            } catch {
              setDownloadError(
                "The production PDF could not be downloaded. Please try again.",
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
          {downloading ? "Preparing PDF..." : "Download Report"}
        </button>
      </div>
    </Modal>
  );
}

export async function downloadProductionPdf(
  production: Production,
  material?: RawMaterial,
  product?: FinishedProduct,
) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const width = pdf.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = width - margin * 2;
  const primary = [79, 70, 229] as const;
  const dark = [15, 23, 42] as const;
  const muted = [100, 116, 139] as const;
  const light = [226, 232, 240] as const;
  const date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(production.date));

  pdf.setFillColor(...dark);
  pdf.roundedRect(margin, 15, 12, 12, 2, 2, "F");
  pdf.setTextColor(...dark);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("StockFlow", margin + 16, 21);
  pdf.setTextColor(...muted);
  pdf.setFontSize(6.5);
  pdf.text("INVENTORY MANAGEMENT", margin + 16, 25);
  pdf.setTextColor(...dark);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(20);
  pdf.text("PRODUCTION REPORT", width - margin, 24, { align: "right" });
  pdf.setFillColor(...primary);
  pdf.rect(0, 34, width, 3.5, "F");

  pdf.setTextColor(...muted);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text("BATCH REFERENCE", margin, 49);
  pdf.setTextColor(...dark);
  pdf.setFontSize(11);
  pdf.text(production.ref, margin, 56);
  const detailsX = width - margin - 60;
  pdf.setFontSize(8);
  pdf.setTextColor(...muted);
  pdf.text("Batch #", detailsX, 49);
  pdf.text("Date", detailsX, 56);
  pdf.setTextColor(...dark);
  pdf.text(production.ref, width - margin, 49, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.text(date, width - margin, 56, { align: "right" });

  const tableY = 75;
  const columns = [38, 68, 30, 42];
  const positions = [margin];
  columns.forEach((column) => positions.push(positions.at(-1)! + column));
  pdf.setFillColor(...dark);
  pdf.rect(margin, tableY, contentWidth, 10, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.text("Movement", positions[0] + 3, tableY + 6.5);
  pdf.text("Item", positions[1] + 3, tableY + 6.5);
  pdf.text("SKU", positions[2] + 3, tableY + 6.5);
  pdf.text("Quantity", positions[4] - 3, tableY + 6.5, { align: "right" });
  pdf.setDrawColor(...light);
  pdf.rect(margin, tableY + 10, contentWidth, 75);

  const rows = [
    {
      movement: "Stock OUT",
      name: material?.name ?? "Raw material",
      sku: material?.sku ?? "-",
      quantity: `-${production.materialQuantity} ${material?.unit ?? ""}`,
      color: [225, 29, 72] as const,
    },
    {
      movement: "Stock IN",
      name: product?.name ?? "Finished product",
      sku: product?.sku ?? "-",
      quantity: `+${production.productQuantity} ${product?.unit ?? ""}`,
      color: [5, 150, 105] as const,
    },
  ];
  rows.forEach((row, index) => {
    const y = tableY + 21 + index * 16;
    if (index) pdf.line(margin, y - 8, width - margin, y - 8);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(row.color[0], row.color[1], row.color[2]);
    pdf.text(row.movement, positions[0] + 3, y);
    pdf.setTextColor(...dark);
    pdf.text(
      pdf.splitTextToSize(row.name, columns[1] - 6),
      positions[1] + 3,
      y,
    );
    pdf.setTextColor(...muted);
    pdf.setFont("helvetica", "normal");
    pdf.text(row.sku, positions[2] + 3, y);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(row.color[0], row.color[1], row.color[2]);
    pdf.text(row.quantity, positions[4] - 3, y, { align: "right" });
  });

  pdf.setFillColor(255, 241, 242);
  pdf.roundedRect(margin, 166, 84, 24, 2, 2, "F");
  pdf.setTextColor(225, 29, 72);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text("MATERIAL CONSUMED", margin + 4, 174);
  pdf.setFontSize(13);
  pdf.text(
    `${production.materialQuantity} ${material?.unit ?? ""}`,
    margin + 4,
    184,
  );
  pdf.setFillColor(236, 253, 245);
  pdf.roundedRect(width - margin - 84, 166, 84, 24, 2, 2, "F");
  pdf.setTextColor(5, 150, 105);
  pdf.setFontSize(7);
  pdf.text("FINISHED OUTPUT", width - margin - 80, 174);
  pdf.setFontSize(13);
  pdf.text(
    `${production.productQuantity} ${product?.unit ?? ""}`,
    width - margin - 80,
    184,
  );

  pdf.setDrawColor(...dark);
  pdf.line(width - margin - 52, 216, width - margin, 216);
  pdf.setTextColor(...muted);
  pdf.setFontSize(6.5);
  pdf.text("AUTHORISED SIGNATURE", width - margin - 26, 221, {
    align: "center",
  });
  pdf.setDrawColor(...primary);
  pdf.setLineWidth(0.8);
  pdf.line(margin, 272, width - margin, 272);
  pdf.setFont("helvetica", "bold");
  pdf.text("STOCKFLOW", margin, 279);
  pdf.text("INVENTORY MANAGEMENT SYSTEM", width - margin, 279, {
    align: "right",
  });

  pdf.save(`production-report-${production.ref}.pdf`);
}
