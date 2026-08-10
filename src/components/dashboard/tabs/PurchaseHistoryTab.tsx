"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowUpDown,
  Download,
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import {
  useAppDispatch,
  useAppSelector,
  useInventoryBusy,
} from "@/store/hooks";
import {
  deletePurchase,
  recordPurchase,
  updatePurchase,
  type Purchase,
  type RawMaterial,
} from "@/store/slices/inventorySlice";
import {
  findCreatedRecord,
  formatCurrency,
  formatDateTime,
  nowIso,
  pageContainingRecord,
} from "@/lib/inventory";
import { getErrorMessage } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";
import Modal, {
  FormField,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../Modal";
import {
  ButtonSpinner,
  ConfirmDialog,
  EmptyState,
  Pagination,
} from "../DataUI";
import PageHeader from "../PageHeader";
import SalesInvoiceModal, { downloadInvoicePdf } from "../SalesInvoiceModal";

const PAGE_SIZE = 6;

export default function PurchaseHistoryTab() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { purchases, rawMaterials, productions } = useAppSelector(
    (state) => state.inventory,
  );
  const activeMaterials = rawMaterials.filter((item) => item.active);
  const [search, setSearch] = useState("");
  const [oldestFirst, setOldestFirst] = useState(false);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Purchase | "new" | null>(null);
  const [deleting, setDeleting] = useState<Purchase | null>(null);
  const [viewing, setViewing] = useState<Purchase | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);
  const rows = useMemo(
    () =>
      purchases
        .filter((row) =>
          `${row.ref} ${row.supplier} ${rawMaterials.find((item) => item.id === row.materialId)?.name}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .sort((a, b) =>
          oldestFirst
            ? a.date.localeCompare(b.date)
            : b.date.localeCompare(a.date),
        ),
    [purchases, rawMaterials, search, oldestFirst],
  );
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = rows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      supplier: String(data.get("supplier")).trim(),
      materialId: Number(data.get("materialId")),
      quantity: Number(data.get("quantity")),
      unitCost: Number(data.get("unitCost")),
      date: new Date(String(data.get("date"))).toISOString(),
    };
    try {
      if (editing === "new") {
        const updated = await dispatch(recordPurchase(payload)).unwrap();
        const created = findCreatedRecord(purchases, updated.purchases);
        if (created) {
          const ordered = [...updated.purchases].sort((a, b) =>
            oldestFirst
              ? a.date.localeCompare(b.date)
              : b.date.localeCompare(a.date),
          );
          setSearch("");
          setPage(pageContainingRecord(ordered, created.id, PAGE_SIZE));
        }
      } else if (editing)
        await dispatch(
          updatePurchase({
            ...editing,
            ...payload,
            total: payload.quantity * payload.unitCost,
          }),
        ).unwrap();
      toast(
        editing === "new"
          ? "Purchase recorded and stock increased."
          : "Purchase updated and stock reconciled.",
      );
      setEditing(null);
    } catch (reason) {
      toast(getErrorMessage(reason, "Unable to save purchase."), "error");
    }
  };

  const remove = async () => {
    if (!deleting) return;
    const material = rawMaterials.find(
      (item) => item.id === deleting.materialId,
    );
    const consumed = productions
      .filter((row) => row.materialId === deleting.materialId)
      .reduce((sum, row) => sum + row.materialQuantity, 0);
    const remainingSupply =
      (material?.openingStock ?? 0) +
      purchases
        .filter(
          (row) =>
            row.materialId === deleting.materialId && row.id !== deleting.id,
        )
        .reduce((sum, row) => sum + row.quantity, 0);
    if (remainingSupply < consumed) {
      toast(
        "This purchase cannot be deleted because later production depends on its stock.",
        "error",
      );
      setDeleting(null);
      return;
    }
    try {
      await dispatch(deletePurchase(deleting.id)).unwrap();
      toast("Purchase deleted and stock reversed.");
      setDeleting(null);
    } catch (reason) {
      toast(getErrorMessage(reason, "Unable to delete purchase."), "error");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Purchases"
        description="Record raw material purchases; stock and movement history update automatically."
        action={
          <button
            onClick={() => setEditing("new")}
            disabled={!activeMaterials.length}
            className={primaryButtonClass}
          >
            <Plus className="h-4 w-4" />
            Record purchase
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Purchase records" value={purchases.length.toString()} />
        <Metric
          label="Total purchase value"
          value={formatCurrency(
            purchases.reduce((sum, row) => sum + row.total, 0),
          )}
        />
        <Metric
          label="Raw stock received"
          value={purchases
            .reduce((sum, row) => sum + row.quantity, 0)
            .toLocaleString()}
        />
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search purchases"
              className={`${inputClass} pl-9`}
            />
          </div>
          <button
            onClick={() => setOldestFirst((value) => !value)}
            className={secondaryButtonClass}
          >
            <ArrowUpDown className="h-4 w-4" />
            {oldestFirst ? "Oldest first" : "Newest first"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Supplier</th>
                <th className="px-5 py-3">Material</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((row) => {
                const material = rawMaterials.find(
                  (item) => item.id === row.materialId,
                );
                return (
                  <tr key={row.id}>
                    <td className="px-5 py-4 font-semibold text-indigo-600">
                      {row.ref}
                    </td>
                    <td className="px-5 py-4">{row.supplier}</td>
                    <td className="px-5 py-4">{material?.name}</td>
                    <td className="px-5 py-4">
                      {row.quantity} {material?.unit}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {formatCurrency(row.total)}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {formatDateTime(row.date)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setViewing(row)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(row)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
                          aria-label={`Edit ${row.ref}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(row)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                          aria-label={`Delete ${row.ref}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                        <button
                          type="button"
                          disabled={downloading === row.id}
                          aria-busy={downloading === row.id}
                          onClick={async () => {
                            setDownloading(row.id);
                            try {
                              await downloadInvoicePdf(
                                {
                                  ref: row.ref,
                                  quantity: row.quantity,
                                  unitPrice: row.unitCost,
                                  total: row.total,
                                  date: row.date,
                                },
                                { name: row.supplier },
                                material,
                                {
                                  documentTitle: "Purchase Bill",
                                  partyLabel: "Supplier",
                                  filenamePrefix: "purchase-bill",
                                },
                              );
                              toast("Purchase bill downloaded.");
                            } catch {
                              toast(
                                "Unable to download the purchase invoice.",
                                "error",
                              );
                            } finally {
                              setDownloading(null);
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {downloading === row.id ? (
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          Download Bill
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!visible.length && <EmptyState />}
        </div>
        <Pagination
          page={currentPage}
          pages={pages}
          total={rows.length}
          onChange={setPage}
        />
      </section>
      {editing && (
        <PurchaseModal
          row={editing === "new" ? undefined : editing}
          materials={editing === "new" ? activeMaterials : rawMaterials}
          onSubmit={submit}
          onClose={() => setEditing(null)}
        />
      )}
      {viewing && (
        <SalesInvoiceModal
          sale={{
            ref: viewing.ref,
            quantity: viewing.quantity,
            unitPrice: viewing.unitCost,
            total: viewing.total,
            date: viewing.date,
          }}
          customer={{ name: viewing.supplier }}
          product={rawMaterials.find(
            (material) => material.id === viewing.materialId,
          )}
          documentTitle="Purchase Bill"
          partyLabel="Supplier"
          filenamePrefix="purchase-bill"
          downloadLabel="Download Bill"
          onClose={() => setViewing(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          description={`Delete ${deleting.ref}? Raw stock will be reduced by ${deleting.quantity}.`}
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}

function PurchaseModal({
  row,
  materials,
  onSubmit,
  onClose,
}: {
  row?: Purchase;
  materials: RawMaterial[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  const busy = useInventoryBusy();
  const [materialId, setMaterialId] = useState(
    row?.materialId ?? materials[0]?.id ?? 0,
  );
  const material = materials.find((item) => item.id === materialId);
  return (
    <Modal
      title={row ? "Edit purchase" : "Record purchase"}
      description="Inventory and reports are recalculated when saved."
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="Supplier">
          <input
            name="supplier"
            required
            minLength={2}
            defaultValue={row?.supplier}
            className={inputClass}
          />
        </FormField>
        <FormField label="Raw material">
          <select
            name="materialId"
            value={materialId}
            onChange={(event) => setMaterialId(Number(event.target.value))}
            className={inputClass}
          >
            {materials.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={`Quantity (${material?.unit ?? "units"})`}>
            <input
              name="quantity"
              required
              min="0.01"
              step="0.01"
              type="number"
              defaultValue={row?.quantity}
              className={inputClass}
            />
          </FormField>
          <FormField label="Unit cost">
            <input
              key={materialId}
              name="unitCost"
              required
              min="0"
              step="0.01"
              type="number"
              defaultValue={row?.unitCost ?? material?.unitCost}
              className={inputClass}
            />
          </FormField>
        </div>
        <FormField label="Date and time">
          <input
            name="date"
            required
            type="datetime-local"
            defaultValue={(row?.date ?? nowIso()).slice(0, 16)}
            className={inputClass}
          />
        </FormField>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className={secondaryButtonClass}
          >
            Cancel
          </button>
          <button
            disabled={busy}
            aria-busy={busy}
            className={primaryButtonClass}
          >
            {busy ? <ButtonSpinner /> : <ShoppingCart className="h-4 w-4" />}
            {busy ? "Saving..." : "Save purchase"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
