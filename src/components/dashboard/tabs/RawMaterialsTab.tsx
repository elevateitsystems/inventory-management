"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  Boxes,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  useAppDispatch,
  useAppSelector,
  useInventoryBusy,
} from "@/store/hooks";
import {
  addRawMaterial,
  deleteRawMaterial,
  toggleRawMaterial,
  updateRawMaterial,
  type RawMaterial,
} from "@/store/slices/inventorySlice";
import {
  findCreatedRecord,
  formatCurrency,
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

const PAGE_SIZE = 5;
export default function RawMaterialsTab() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const busy = useInventoryBusy();
  const {
    rawMaterials: materials,
    purchases,
    productions,
  } = useAppSelector((state) => state.inventory);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<"name" | "stock">("name");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<RawMaterial | "new" | null>(null);
  const [deleting, setDeleting] = useState<RawMaterial | null>(null);
  const rows = useMemo(
    () =>
      materials
        .filter(
          (x) =>
            `${x.name} ${x.sku}`.toLowerCase().includes(search.toLowerCase()) &&
            (status === "all" || (status === "active") === x.active),
        )
        .sort((a, b) =>
          sort === "name" ? a.name.localeCompare(b.name) : b.stock - a.stock,
        ),
    [materials, search, status, sort],
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
    const sku = String(data.get("sku")).trim();
    if (
      materials.some(
        (x) =>
          x.sku.toLowerCase() === sku.toLowerCase() &&
          x.id !== (editing === "new" ? -1 : editing?.id),
      )
    )
      return toast("SKU must be unique.", "error");
    const payload = {
      name: String(data.get("name")).trim(),
      sku,
      unit: String(data.get("unit")),
      reorderLevel: Number(data.get("reorderLevel")),
      unitCost: Number(data.get("unitCost")),
      active: data.get("active") === "on",
    };
    try {
      if (editing === "new") {
        const updated = await dispatch(
          addRawMaterial({ ...payload, stock: Number(data.get("stock")) }),
        ).unwrap();
        const created = findCreatedRecord(materials, updated.rawMaterials);
        if (created) {
          const ordered = [...updated.rawMaterials].sort((a, b) =>
            sort === "name" ? a.name.localeCompare(b.name) : b.stock - a.stock,
          );
          setSearch("");
          setStatus("all");
          setPage(pageContainingRecord(ordered, created.id, PAGE_SIZE));
        }
      } else if (editing)
        await dispatch(
          updateRawMaterial({
            id: editing.id,
            changes: { ...payload, openingStock: Number(data.get("stock")) },
          }),
        ).unwrap();
      toast(
        editing === "new" ? "Raw material created." : "Raw material updated.",
      );
      setEditing(null);
    } catch (reason) {
      toast(getErrorMessage(reason, "Unable to save material."), "error");
    }
  };
  const confirmDelete = async () => {
    if (!deleting) return;
    const used =
      purchases.some((x) => x.materialId === deleting.id) ||
      productions.some((x) => x.materialId === deleting.id);
    if (used) {
      toast(
        "This material has transaction history and cannot be deleted. Set it inactive instead.",
        "error",
      );
      setDeleting(null);
      return;
    }
    try {
      await dispatch(deleteRawMaterial(deleting.id)).unwrap();
      toast("Raw material deleted.");
      setDeleting(null);
    } catch (reason) {
      toast(getErrorMessage(reason, "Unable to delete material."), "error");
    }
  };
  return (
    <div className="space-y-5">
      <PageHeader
        title="Raw Materials"
        description="Manage inputs used in production and monitor available stock."
        action={
          <button
            onClick={() => setEditing("new")}
            className={primaryButtonClass}
          >
            <Plus className="h-4 w-4" />
            Add raw material
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Summary
          label="Material types"
          value={materials.length.toString()}
          icon={<Boxes className="h-5 w-5" />}
        />
        <Summary
          label="Total stock units"
          value={materials.reduce((s, x) => s + x.stock, 0).toLocaleString()}
          icon={<Boxes className="h-5 w-5" />}
        />
        <Summary
          label="Below reorder level"
          value={materials
            .filter((x) => x.active && x.stock <= x.reorderLevel)
            .length.toString()}
          icon={<AlertTriangle className="h-5 w-5" />}
          warning
        />
      </div>
      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:p-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search material or SKU"
              className={`${inputClass} pl-9`}
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className={`${inputClass} sm:w-40`}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => setSort(sort === "name" ? "stock" : "name")}
            className={secondaryButtonClass}
          >
            <ArrowUpDown className="h-4 w-4" />
            Sort: {sort}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Material</th>
                <th className="px-5 py-3">Available</th>
                <th className="px-5 py-3">Reorder</th>
                <th className="px-5 py-3">Unit cost</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((item) => {
                const low = item.stock <= item.reorderLevel;
                return (
                  <tr key={item.id} className="text-sm hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.sku} · {item.unit}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {item.stock.toLocaleString()} {item.unit}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.reorderLevel.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      {formatCurrency(item.unitCost)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${low ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
                      >
                        {item.stock === 0
                          ? "Out of stock"
                          : low
                            ? "Low stock"
                            : "In stock"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        disabled={busy}
                        aria-busy={busy}
                        onClick={async () => {
                          try {
                            await dispatch(toggleRawMaterial(item.id)).unwrap();
                            toast(
                              `Material marked ${item.active ? "inactive" : "active"}.`,
                            );
                          } catch (reason) {
                            toast(
                              getErrorMessage(
                                reason,
                                "Unable to update material.",
                              ),
                              "error",
                            );
                          }
                        }}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.active ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {busy ? (
                          <ButtonSpinner />
                        ) : item.active ? (
                          "Active"
                        ) : (
                          "Inactive"
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(item)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
                          aria-label={`Edit ${item.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(item)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
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
        <Modal
          title={editing === "new" ? "Add raw material" : "Edit raw material"}
          description="Stock entered here is the opening balance; transactions remain linked."
          onClose={() => setEditing(null)}
        >
          <MaterialForm
            item={editing === "new" ? undefined : editing}
            onSubmit={submit}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          description={`Delete ${deleting.name}? This cannot be undone.`}
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
function MaterialForm({
  item,
  onSubmit,
  onCancel,
}: {
  item?: RawMaterial;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const busy = useInventoryBusy();
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <FormField label="Material name">
        <input
          name="name"
          required
          minLength={2}
          defaultValue={item?.name}
          className={inputClass}
        />
      </FormField>
      <FormField label="SKU">
        <input
          name="sku"
          required
          defaultValue={item?.sku}
          className={inputClass}
        />
      </FormField>
      <FormField label="Unit">
        <select
          name="unit"
          defaultValue={item?.unit ?? "kg"}
          className={inputClass}
        >
          <option>kg</option>
          <option>litres</option>
          <option>pcs</option>
          <option>packs</option>
        </select>
      </FormField>
      <FormField label="Opening stock">
        <input
          name="stock"
          required
          min="0"
          step="0.01"
          type="number"
          defaultValue={item?.openingStock ?? 0}
          className={inputClass}
        />
      </FormField>
      <FormField label="Reorder level">
        <input
          name="reorderLevel"
          required
          min="0"
          step="0.01"
          type="number"
          defaultValue={item?.reorderLevel ?? 0}
          className={inputClass}
        />
      </FormField>
      <FormField label="Unit cost">
        <input
          name="unitCost"
          required
          min="0"
          step="0.01"
          type="number"
          defaultValue={item?.unitCost ?? 0}
          className={inputClass}
        />
      </FormField>
      <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
        <input
          name="active"
          type="checkbox"
          defaultChecked={item?.active ?? true}
          className="accent-indigo-600"
        />
        Active and available for transactions
      </label>
      <div className="flex justify-end gap-3 sm:col-span-2">
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className={secondaryButtonClass}
        >
          Cancel
        </button>
        <button disabled={busy} aria-busy={busy} className={primaryButtonClass}>
          {busy && <ButtonSpinner />}
          {busy ? "Saving..." : "Save material"}
        </button>
      </div>
    </form>
  );
}
function Summary({
  label,
  value,
  icon,
  warning = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div
        className={`grid h-11 w-11 place-items-center rounded-xl ${warning ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
