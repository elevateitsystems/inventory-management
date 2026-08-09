import { z } from "zod";

const id = z.number().int().positive();
const name = z.string().trim().min(2).max(160);
const sku = z.string().trim().min(1).max(80);
const unit = z.string().trim().min(1).max(30);
const quantity = z.number().finite().positive().max(1_000_000_000);
const nonnegative = z.number().finite().nonnegative().max(1_000_000_000);
const money = z.number().finite().nonnegative().max(1_000_000_000_000);
const date = z.iso.datetime({ offset: true });

const materialFields = z.object({
  name,
  sku,
  unit,
  openingStock: nonnegative,
  reorderLevel: nonnegative,
  unitCost: money,
  active: z.boolean(),
});
const productFields = z.object({
  name,
  sku,
  unit,
  openingStock: nonnegative,
  reorderLevel: nonnegative,
  salePrice: money,
  active: z.boolean(),
});
const customerFields = z.object({
  name,
  phone: z.string().trim().min(1).max(60),
  email: z.email().trim().toLowerCase().max(320),
  active: z.boolean(),
});
const purchaseFields = z.object({
  supplier: name,
  materialId: id,
  quantity,
  unitCost: money,
  date,
});
const productionFields = z.object({
  materialId: id,
  materialQuantity: quantity,
  productId: id,
  productQuantity: quantity,
  date,
});
const saleFields = z.object({
  customerId: id,
  productId: id,
  quantity,
  unitPrice: money,
  date,
});
const returnFields = saleFields;
const paymentFields = z.object({
  customerId: id,
  amount: z.number().finite().positive().max(1_000_000_000_000),
  date,
});

export const inventoryActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("material.create"), payload: materialFields }),
  z.object({
    type: z.literal("material.update"),
    payload: materialFields.extend({ id }),
  }),
  z.object({ type: z.literal("material.toggle"), payload: z.object({ id }) }),
  z.object({ type: z.literal("material.delete"), payload: z.object({ id }) }),
  z.object({ type: z.literal("product.create"), payload: productFields }),
  z.object({
    type: z.literal("product.update"),
    payload: productFields.extend({ id }),
  }),
  z.object({ type: z.literal("product.toggle"), payload: z.object({ id }) }),
  z.object({ type: z.literal("product.delete"), payload: z.object({ id }) }),
  z.object({ type: z.literal("customer.create"), payload: customerFields }),
  z.object({
    type: z.literal("customer.update"),
    payload: customerFields.extend({ id }),
  }),
  z.object({ type: z.literal("customer.toggle"), payload: z.object({ id }) }),
  z.object({ type: z.literal("customer.delete"), payload: z.object({ id }) }),
  z.object({ type: z.literal("purchase.create"), payload: purchaseFields }),
  z.object({
    type: z.literal("purchase.update"),
    payload: purchaseFields.extend({ id }),
  }),
  z.object({ type: z.literal("purchase.delete"), payload: z.object({ id }) }),
  z.object({ type: z.literal("production.create"), payload: productionFields }),
  z.object({
    type: z.literal("production.update"),
    payload: productionFields.extend({ id }),
  }),
  z.object({ type: z.literal("production.delete"), payload: z.object({ id }) }),
  z.object({
    type: z.literal("sale.create"),
    payload: saleFields.extend({ payment: money }),
  }),
  z.object({
    type: z.literal("sale.update"),
    payload: saleFields.extend({ id }),
  }),
  z.object({ type: z.literal("sale.delete"), payload: z.object({ id }) }),
  z.object({ type: z.literal("payment.create"), payload: paymentFields }),
  z.object({
    type: z.literal("payment.update"),
    payload: paymentFields.extend({ id }),
  }),
  z.object({ type: z.literal("payment.delete"), payload: z.object({ id }) }),
  z.object({ type: z.literal("return.create"), payload: returnFields }),
  z.object({
    type: z.literal("return.update"),
    payload: returnFields.extend({ id }),
  }),
  z.object({ type: z.literal("return.delete"), payload: z.object({ id }) }),
]);

export type InventoryAction = z.infer<typeof inventoryActionSchema>;
