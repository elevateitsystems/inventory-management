"use client";
import { getErrorMessage } from "@/lib/api";
import { useMemo, useState, type FormEvent } from "react";
import {
  Download,
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import {
  useAppDispatch,
  useAppSelector,
  useInventoryBusy,
} from "@/store/hooks";
import {
  deleteSale,
  recordSale,
  updateSale,
  type Customer,
  type FinishedProduct,
  type Sale,
} from "@/store/slices/inventorySlice";
import {
  findCreatedRecord,
  formatCurrency,
  formatDateTime,
  nowIso,
  pageContainingRecord,
} from "@/lib/inventory";
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
const SIZE = 6;
export default function SalesHistoryTab() {
  const dispatch = useAppDispatch(),
    toast = useToast();
  const { sales, customers, finishedProducts } = useAppSelector(
    (s) => s.inventory,
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Sale | "new" | null>(null);
  const [deleting, setDeleting] = useState<Sale | null>(null);
  const [invoicing, setInvoicing] = useState<Sale | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);
  const activeC = customers.filter((x) => x.active),
    activeP = finishedProducts.filter((x) => x.active && x.stock > 0);
  const rows = useMemo(
    () =>
      [...sales]
        .filter((x) =>
          `${x.ref} ${customers.find((c) => c.id === x.customerId)?.name} ${finishedProducts.find((p) => p.id === x.productId)?.name}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [sales, customers, finishedProducts, search],
  );
  const pages = Math.max(1, Math.ceil(rows.length / SIZE)),
    current = Math.min(page, pages),
    visible = rows.slice((current - 1) * SIZE, current * SIZE);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget),
      payload = {
        customerId: Number(d.get("customerId")),
        productId: Number(d.get("productId")),
        quantity: Number(d.get("quantity")),
        unitPrice: Number(d.get("unitPrice")),
        date: new Date(String(d.get("date"))).toISOString(),
      };
    const p = finishedProducts.find((x) => x.id === payload.productId),
      available =
        (p?.stock ?? 0) +
        (editing !== "new" && editing?.productId === payload.productId
          ? editing.quantity
          : 0);
    if (payload.quantity > available)
      return toast("Not enough finished product stock for this sale.", "error");
    try {
      if (editing === "new") {
        const updated = await dispatch(
          recordSale({
            ...payload,
            payment: Math.min(
              Number(d.get("payment")),
              payload.quantity * payload.unitPrice,
            ),
          }),
        ).unwrap();
        const created = findCreatedRecord(sales, updated.sales);
        if (created) {
          const ordered = [...updated.sales].sort((a, b) =>
            b.date.localeCompare(a.date),
          );
          setSearch("");
          setPage(pageContainingRecord(ordered, created.id, SIZE));
        }
      } else if (editing)
        await dispatch(
          updateSale({
            ...editing,
            ...payload,
            total: payload.quantity * payload.unitPrice,
          }),
        ).unwrap();
      toast(
        editing === "new"
          ? "Sale completed; stock and ledger updated."
          : "Sale updated and balances reconciled.",
      );
      setEditing(null);
    } catch (reason) {
      toast(getErrorMessage(reason, "Unable to save sale."), "error");
    }
  };
  return (
    <div className="space-y-5">
      <PageHeader
        title="Sales"
        description="Record customer sales and automatically update finished stock and the customer ledger."
        action={
          <button
            onClick={() => setEditing("new")}
            disabled={!activeC.length || !activeP.length}
            className={primaryButtonClass}
          >
            <Plus className="h-4 w-4" />
            New sale
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Sales invoices" value={sales.length.toString()} />
        <Metric
          label="Total sales"
          value={formatCurrency(sales.reduce((s, x) => s + x.total, 0))}
        />
        <Metric
          label="Units sold"
          value={sales.reduce((s, x) => s + x.quantity, 0).toLocaleString()}
        />
      </div>
      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search invoices"
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((x) => {
                const c = customers.find((y) => y.id === x.customerId),
                  p = finishedProducts.find((y) => y.id === x.productId);
                return (
                  <tr key={x.id}>
                    <td className="px-5 py-4 font-semibold text-indigo-600">
                      {x.ref}
                    </td>
                    <td className="px-5 py-4 font-medium">{c?.name}</td>
                    <td className="px-5 py-4">{p?.name}</td>
                    <td className="px-5 py-4">
                      {x.quantity} {p?.unit}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {formatCurrency(x.total)}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {formatDateTime(x.date)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setInvoicing(x)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                          aria-label={`View invoice ${x.ref}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(x)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
                          aria-label={`Edit invoice ${x.ref}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(x)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                          aria-label={`Delete invoice ${x.ref}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                        <button
                          type="button"
                          disabled={downloading === x.id}
                          aria-busy={downloading === x.id}
                          onClick={async () => {
                            setDownloading(x.id);
                            try {
                              await downloadInvoicePdf(x, c, p);
                              toast("Sales invoice downloaded.");
                            } catch {
                              toast(
                                "Unable to download the sales invoice.",
                                "error",
                              );
                            } finally {
                              setDownloading(null);
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {downloading === x.id ? (
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          Download Invoice
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
          page={current}
          pages={pages}
          total={rows.length}
          onChange={setPage}
        />
      </section>
      {editing && (
        <SaleModal
          row={editing === "new" ? undefined : editing}
          customers={editing === "new" ? activeC : customers}
          products={editing === "new" ? activeP : finishedProducts}
          onSubmit={submit}
          onClose={() => setEditing(null)}
        />
      )}{" "}
      {invoicing && (
        <SalesInvoiceModal
          sale={invoicing}
          customer={customers.find(
            (customer) => customer.id === invoicing.customerId,
          )}
          product={finishedProducts.find(
            (product) => product.id === invoicing.productId,
          )}
          onClose={() => setInvoicing(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          description={`Delete ${deleting.ref}? Stock will be restored and its ledger debit removed.`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await dispatch(deleteSale(deleting.id)).unwrap();
              toast("Sale deleted; stock and ledger reversed.");
              setDeleting(null);
            } catch (reason) {
              toast(getErrorMessage(reason, "Unable to delete sale."), "error");
            }
          }}
        />
      )}
    </div>
  );
}
function SaleModal({
  row,
  customers,
  products,
  onSubmit,
  onClose,
}: {
  row?: Sale;
  customers: Customer[];
  products: FinishedProduct[];
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  const busy = useInventoryBusy();
  const [pid, setPid] = useState(row?.productId ?? products[0]?.id ?? 0),
    p = products.find((x) => x.id === pid);
  const [q, setQ] = useState(row?.quantity ?? 1),
    [price, setPrice] = useState(row?.unitPrice ?? p?.salePrice ?? 0);
  const choose = (id: number) => {
    setPid(id);
    setPrice(products.find((x) => x.id === id)?.salePrice ?? 0);
  };
  return (
    <Modal
      title={row ? "Edit sale" : "Record product sale"}
      description="Saving reconciles stock, transaction history, and the customer ledger."
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="Customer">
          <select
            name="customerId"
            defaultValue={row?.customerId ?? customers[0]?.id}
            className={inputClass}
          >
            {customers.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Finished product">
          <select
            name="productId"
            value={pid}
            onChange={(e) => choose(Number(e.target.value))}
            className={inputClass}
          >
            {products.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name} —{" "}
                {x.stock + (row?.productId === x.id ? row.quantity : 0)}{" "}
                available
              </option>
            ))}
          </select>
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={`Quantity (${p?.unit ?? "units"})`}>
            <input
              name="quantity"
              value={q}
              onChange={(e) => setQ(Number(e.target.value))}
              required
              min="0.01"
              step="0.01"
              type="number"
              className={inputClass}
            />
          </FormField>
          <FormField label="Unit price">
            <input
              name="unitPrice"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              min="0"
              step="0.01"
              type="number"
              className={inputClass}
            />
          </FormField>
        </div>
        {!row && (
          <FormField
            label="Payment received now"
            hint={`Invoice total: ${formatCurrency(q * price)}`}
          >
            <input
              name="payment"
              defaultValue="0"
              min="0"
              max={q * price}
              step="0.01"
              type="number"
              className={inputClass}
            />
          </FormField>
        )}
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
            {busy ? <ButtonSpinner /> : <ShoppingBag className="h-4 w-4" />}
            {busy ? "Saving..." : "Save sale"}
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
