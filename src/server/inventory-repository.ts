import { ApiError } from "./api-error";
import { transaction, type PrismaExecutor } from "./db";
import type { InventoryAction } from "./inventory-schemas";
import type {
  DailyTransaction,
  InventoryState,
  LedgerEntry,
  StockMovement,
} from "@/types/inventory";
import type { Prisma } from "@/generated/prisma/client";

const n = (value: unknown) => Number(value);
const iso = (value: Date) => value.toISOString();
const ref = (prefix: string, id: number) =>
  `${prefix}-${id.toString().padStart(4, "0")}`;

export async function loadInventory(
  client: PrismaExecutor,
  ownerId: number,
): Promise<InventoryState> {
  const ownerKey = BigInt(ownerId);
  const [
    materialRows,
    productRows,
    customerRows,
    purchaseRows,
    productionRows,
    saleRows,
    returnRows,
    paymentRows,
  ] = await Promise.all([
    client.rawMaterial.findMany({
      where: { ownerId: ownerKey },
      orderBy: { id: "asc" },
    }),
    client.finishedProduct.findMany({
      where: { ownerId: ownerKey },
      orderBy: { id: "asc" },
    }),
    client.customer.findMany({
      where: { ownerId: ownerKey },
      orderBy: { id: "asc" },
    }),
    client.purchase.findMany({
      where: { ownerId: ownerKey },
      orderBy: { id: "asc" },
    }),
    client.production.findMany({
      where: { ownerId: ownerKey },
      orderBy: { id: "asc" },
    }),
    client.sale.findMany({
      where: { ownerId: ownerKey },
      orderBy: { id: "asc" },
    }),
    client.productReturn.findMany({
      where: { ownerId: ownerKey },
      orderBy: { id: "asc" },
    }),
    client.payment.findMany({
      where: { ownerId: ownerKey },
      orderBy: { id: "asc" },
    }),
  ]);

  const rawMaterials = materialRows.map((row) => ({
    id: n(row.id),
    name: row.name,
    sku: row.sku,
    unit: row.unit,
    stock: n(row.openingStock),
    openingStock: n(row.openingStock),
    reorderLevel: n(row.reorderLevel),
    unitCost: n(row.unitCost),
    active: row.active,
  }));
  const finishedProducts = productRows.map((row) => ({
    id: n(row.id),
    name: row.name,
    sku: row.sku,
    unit: row.unit,
    stock: n(row.openingStock),
    openingStock: n(row.openingStock),
    reorderLevel: n(row.reorderLevel),
    salePrice: n(row.salePrice),
    active: row.active,
  }));
  const customers = customerRows.map((row) => ({
    id: n(row.id),
    name: row.name,
    phone: row.phone,
    email: row.email,
    active: row.active,
  }));
  const purchases = purchaseRows.map((row) => ({
    id: n(row.id),
    ref: ref("PUR", n(row.id)),
    supplier: row.supplier,
    materialId: n(row.materialId),
    quantity: n(row.quantity),
    unitCost: n(row.unitCost),
    total: n(row.quantity) * n(row.unitCost),
    date: iso(row.occurredAt),
  }));
  const productions = productionRows.map((row) => ({
    id: n(row.id),
    ref: ref("PRD", n(row.id)),
    materialId: n(row.materialId),
    materialQuantity: n(row.materialQuantity),
    productId: n(row.productId),
    productQuantity: n(row.productQuantity),
    date: iso(row.occurredAt),
  }));
  const sales = saleRows.map((row) => ({
    id: n(row.id),
    ref: ref("SAL", n(row.id)),
    customerId: n(row.customerId),
    productId: n(row.productId),
    quantity: n(row.quantity),
    unitPrice: n(row.unitPrice),
    total: n(row.quantity) * n(row.unitPrice),
    date: iso(row.occurredAt),
  }));
  const returns = returnRows.map((row) => ({
    id: n(row.id),
    ref: ref("RET", n(row.id)),
    customerId: n(row.customerId),
    productId: n(row.productId),
    quantity: n(row.quantity),
    unitPrice: n(row.unitPrice),
    total: n(row.quantity) * n(row.unitPrice),
    date: iso(row.occurredAt),
  }));
  const payments = paymentRows.map((row) => ({
    id: n(row.id),
    ref: ref("PAY", n(row.id)),
    customerId: n(row.customerId),
    amount: n(row.amount),
    date: iso(row.occurredAt),
    note: row.note,
  }));

  const stockMovements: StockMovement[] = [];
  const ledger: LedgerEntry[] = [];
  const transactions: DailyTransaction[] = [];
  let movementId = 1,
    ledgerId = 1,
    transactionId = 1;
  for (const row of purchases) {
    const item = rawMaterials.find((x) => x.id === row.materialId);
    if (!item) continue;
    item.stock += row.quantity;
    stockMovements.push({
      id: movementId++,
      stockType: "raw",
      itemId: item.id,
      itemName: item.name,
      type: "IN",
      quantity: row.quantity,
      reason: "Purchase",
      ref: row.ref,
      date: row.date,
    });
    transactions.push({
      id: transactionId++,
      type: "Purchase",
      ref: row.ref,
      party: row.supplier,
      amount: row.total,
      date: row.date,
    });
  }
  for (const row of productions) {
    const material = rawMaterials.find((x) => x.id === row.materialId);
    const product = finishedProducts.find((x) => x.id === row.productId);
    if (!material || !product) continue;
    material.stock -= row.materialQuantity;
    product.stock += row.productQuantity;
    stockMovements.push(
      {
        id: movementId++,
        stockType: "raw",
        itemId: material.id,
        itemName: material.name,
        type: "OUT",
        quantity: row.materialQuantity,
        reason: "Production",
        ref: row.ref,
        date: row.date,
      },
      {
        id: movementId++,
        stockType: "finished",
        itemId: product.id,
        itemName: product.name,
        type: "IN",
        quantity: row.productQuantity,
        reason: "Production",
        ref: row.ref,
        date: row.date,
      },
    );
    transactions.push({
      id: transactionId++,
      type: "Production",
      ref: row.ref,
      party: product.name,
      amount: 0,
      date: row.date,
    });
  }
  for (const row of sales) {
    const product = finishedProducts.find((x) => x.id === row.productId);
    const customer = customers.find((x) => x.id === row.customerId);
    if (!product || !customer) continue;
    product.stock -= row.quantity;
    stockMovements.push({
      id: movementId++,
      stockType: "finished",
      itemId: product.id,
      itemName: product.name,
      type: "OUT",
      quantity: row.quantity,
      reason: "Sale",
      ref: row.ref,
      date: row.date,
    });
    ledger.push({
      id: ledgerId++,
      customerId: customer.id,
      type: "Sale",
      ref: row.ref,
      debit: row.total,
      credit: 0,
      date: row.date,
      note: `${row.quantity} ${product.unit} ${product.name}`,
    });
    transactions.push({
      id: transactionId++,
      type: "Sale",
      ref: row.ref,
      party: customer.name,
      amount: row.total,
      date: row.date,
    });
  }
  for (const row of returns) {
    const product = finishedProducts.find((x) => x.id === row.productId);
    const customer = customers.find((x) => x.id === row.customerId);
    if (!product || !customer) continue;
    product.stock += row.quantity;
    stockMovements.push({
      id: movementId++,
      stockType: "finished",
      itemId: product.id,
      itemName: product.name,
      type: "IN",
      quantity: row.quantity,
      reason: "Return",
      ref: row.ref,
      date: row.date,
    });
    ledger.push({
      id: ledgerId++,
      customerId: customer.id,
      type: "Return",
      ref: row.ref,
      debit: 0,
      credit: row.total,
      date: row.date,
      note: `${row.quantity} ${product.unit} ${product.name} returned`,
    });
    transactions.push({
      id: transactionId++,
      type: "Return",
      ref: row.ref,
      party: customer.name,
      amount: row.total,
      date: row.date,
    });
  }
  for (const row of payments) {
    const customer = customers.find((x) => x.id === row.customerId);
    if (!customer) continue;
    ledger.push({
      id: ledgerId++,
      customerId: customer.id,
      type: "Payment",
      ref: row.ref,
      debit: 0,
      credit: row.amount,
      date: row.date,
      note: row.note,
    });
    transactions.push({
      id: transactionId++,
      type: "Payment",
      ref: row.ref,
      party: customer.name,
      amount: row.amount,
      date: row.date,
    });
  }
  const newest = <T extends { date: string }>(items: T[]) =>
    items.sort((a, b) => b.date.localeCompare(a.date));
  return {
    rawMaterials,
    finishedProducts,
    customers,
    purchases,
    productions,
    sales,
    returns,
    payments,
    ledger: newest(ledger),
    stockMovements: newest(stockMovements),
    transactions: newest(transactions),
  };
}

export async function mutateInventory(
  ownerId: number,
  action: InventoryAction,
) {
  return transaction(async (client) => {
    const ownerKey = BigInt(ownerId);
    await client.$executeRaw`SELECT pg_advisory_xact_lock(${ownerKey})`;
    const p = action.payload as Record<string, unknown>;
    const id = () => BigInt(n(p.id));
    const date = () => new Date(String(p.date));
    switch (action.type) {
      case "material.create":
        await client.rawMaterial.create({
          data: {
            ownerId: ownerKey,
            name: String(p.name),
            sku: String(p.sku),
            unit: String(p.unit),
            openingStock: n(p.openingStock),
            reorderLevel: n(p.reorderLevel),
            unitCost: n(p.unitCost),
            active: Boolean(p.active),
          },
        });
        break;
      case "material.update":
        assertChanged(
          await client.rawMaterial.updateMany({
            where: { id: id(), ownerId: ownerKey },
            data: {
              name: String(p.name),
              sku: String(p.sku),
              unit: String(p.unit),
              openingStock: n(p.openingStock),
              reorderLevel: n(p.reorderLevel),
              unitCost: n(p.unitCost),
              active: Boolean(p.active),
              updatedAt: new Date(),
            },
          }),
        );
        break;
      case "material.toggle":
        await toggleMaterial(client, id(), ownerKey);
        break;
      case "material.delete":
        assertChanged(
          await client.rawMaterial.deleteMany({
            where: { id: id(), ownerId: ownerKey },
          }),
        );
        break;
      case "product.create":
        await client.finishedProduct.create({
          data: {
            ownerId: ownerKey,
            name: String(p.name),
            sku: String(p.sku),
            unit: String(p.unit),
            openingStock: n(p.openingStock),
            reorderLevel: n(p.reorderLevel),
            salePrice: n(p.salePrice),
            active: Boolean(p.active),
          },
        });
        break;
      case "product.update":
        assertChanged(
          await client.finishedProduct.updateMany({
            where: { id: id(), ownerId: ownerKey },
            data: {
              name: String(p.name),
              sku: String(p.sku),
              unit: String(p.unit),
              openingStock: n(p.openingStock),
              reorderLevel: n(p.reorderLevel),
              salePrice: n(p.salePrice),
              active: Boolean(p.active),
              updatedAt: new Date(),
            },
          }),
        );
        break;
      case "product.toggle":
        await toggleProduct(client, id(), ownerKey);
        break;
      case "product.delete":
        assertChanged(
          await client.finishedProduct.deleteMany({
            where: { id: id(), ownerId: ownerKey },
          }),
        );
        break;
      case "customer.create":
        await client.customer.create({
          data: {
            ownerId: ownerKey,
            name: String(p.name),
            phone: String(p.phone),
            email: String(p.email),
            active: Boolean(p.active),
          },
        });
        break;
      case "customer.update":
        assertChanged(
          await client.customer.updateMany({
            where: { id: id(), ownerId: ownerKey },
            data: {
              name: String(p.name),
              phone: String(p.phone),
              email: String(p.email),
              active: Boolean(p.active),
              updatedAt: new Date(),
            },
          }),
        );
        break;
      case "customer.toggle":
        await toggleCustomer(client, id(), ownerKey);
        break;
      case "customer.delete":
        assertChanged(
          await client.customer.deleteMany({
            where: { id: id(), ownerId: ownerKey },
          }),
        );
        break;
      case "purchase.create":
        await ensureMaterial(client, BigInt(n(p.materialId)), ownerKey);
        await client.purchase.create({
          data: {
            ownerId: ownerKey,
            supplier: String(p.supplier),
            materialId: BigInt(n(p.materialId)),
            quantity: n(p.quantity),
            unitCost: n(p.unitCost),
            occurredAt: date(),
          },
        });
        break;
      case "purchase.update":
        await ensureMaterial(client, BigInt(n(p.materialId)), ownerKey);
        assertChanged(
          await client.purchase.updateMany({
            where: { id: id(), ownerId: ownerKey },
            data: {
              supplier: String(p.supplier),
              materialId: BigInt(n(p.materialId)),
              quantity: n(p.quantity),
              unitCost: n(p.unitCost),
              occurredAt: date(),
            },
          }),
        );
        break;
      case "purchase.delete":
        assertChanged(
          await client.purchase.deleteMany({
            where: { id: id(), ownerId: ownerKey },
          }),
        );
        break;
      case "production.create":
        await ensureMaterial(client, BigInt(n(p.materialId)), ownerKey);
        await ensureProduct(client, BigInt(n(p.productId)), ownerKey);
        await client.production.create({
          data: {
            ownerId: ownerKey,
            materialId: BigInt(n(p.materialId)),
            materialQuantity: n(p.materialQuantity),
            productId: BigInt(n(p.productId)),
            productQuantity: n(p.productQuantity),
            occurredAt: date(),
          },
        });
        break;
      case "production.update":
        await ensureMaterial(client, BigInt(n(p.materialId)), ownerKey);
        await ensureProduct(client, BigInt(n(p.productId)), ownerKey);
        assertChanged(
          await client.production.updateMany({
            where: { id: id(), ownerId: ownerKey },
            data: {
              materialId: BigInt(n(p.materialId)),
              materialQuantity: n(p.materialQuantity),
              productId: BigInt(n(p.productId)),
              productQuantity: n(p.productQuantity),
              occurredAt: date(),
            },
          }),
        );
        break;
      case "production.delete":
        assertChanged(
          await client.production.deleteMany({
            where: { id: id(), ownerId: ownerKey },
          }),
        );
        break;
      case "sale.create": {
        await ensureCustomer(client, BigInt(n(p.customerId)), ownerKey);
        await ensureProduct(client, BigInt(n(p.productId)), ownerKey);
        const sale = await client.sale.create({
          data: {
            ownerId: ownerKey,
            customerId: BigInt(n(p.customerId)),
            productId: BigInt(n(p.productId)),
            quantity: n(p.quantity),
            unitPrice: n(p.unitPrice),
            occurredAt: date(),
          },
        });
        if (n(p.payment) > 0)
          await client.payment.create({
            data: {
              ownerId: ownerKey,
              customerId: BigInt(n(p.customerId)),
              amount: n(p.payment),
              occurredAt: date(),
              note: `Payment received with ${ref("SAL", n(sale.id))}`,
              saleId: sale.id,
            },
          });
        break;
      }
      case "sale.update":
        await ensureCustomer(client, BigInt(n(p.customerId)), ownerKey);
        await ensureProduct(client, BigInt(n(p.productId)), ownerKey);
        assertChanged(
          await client.sale.updateMany({
            where: { id: id(), ownerId: ownerKey },
            data: {
              customerId: BigInt(n(p.customerId)),
              productId: BigInt(n(p.productId)),
              quantity: n(p.quantity),
              unitPrice: n(p.unitPrice),
              occurredAt: date(),
            },
          }),
        );
        break;
      case "sale.delete":
        assertChanged(
          await client.sale.deleteMany({
            where: { id: id(), ownerId: ownerKey },
          }),
        );
        break;
      case "payment.create":
        await ensureCustomer(client, BigInt(n(p.customerId)), ownerKey);
        await client.payment.create({
          data: {
            ownerId: ownerKey,
            customerId: BigInt(n(p.customerId)),
            amount: n(p.amount),
            occurredAt: date(),
            note: "Customer payment received",
          },
        });
        break;
      case "payment.update":
        await ensureCustomer(client, BigInt(n(p.customerId)), ownerKey);
        assertChanged(
          await client.payment.updateMany({
            where: { id: id(), ownerId: ownerKey },
            data: {
              customerId: BigInt(n(p.customerId)),
              amount: n(p.amount),
              occurredAt: date(),
            },
          }),
        );
        break;
      case "payment.delete":
        assertChanged(
          await client.payment.deleteMany({
            where: { id: id(), ownerId: ownerKey },
          }),
        );
        break;
      case "return.create":
        await ensureCustomer(client, BigInt(n(p.customerId)), ownerKey);
        await ensureProduct(client, BigInt(n(p.productId)), ownerKey);
        await client.productReturn.create({
          data: {
            ownerId: ownerKey,
            customerId: BigInt(n(p.customerId)),
            productId: BigInt(n(p.productId)),
            quantity: n(p.quantity),
            unitPrice: n(p.unitPrice),
            occurredAt: date(),
          },
        });
        break;
      case "return.update":
        await ensureCustomer(client, BigInt(n(p.customerId)), ownerKey);
        await ensureProduct(client, BigInt(n(p.productId)), ownerKey);
        assertChanged(
          await client.productReturn.updateMany({
            where: { id: id(), ownerId: ownerKey },
            data: {
              customerId: BigInt(n(p.customerId)),
              productId: BigInt(n(p.productId)),
              quantity: n(p.quantity),
              unitPrice: n(p.unitPrice),
              occurredAt: date(),
            },
          }),
        );
        break;
      case "return.delete":
        assertChanged(
          await client.productReturn.deleteMany({
            where: { id: id(), ownerId: ownerKey },
          }),
        );
        break;
    }
    const state = await loadInventory(client, ownerId);
    if (
      state.rawMaterials.some((x) => x.stock < 0) ||
      state.finishedProducts.some((x) => x.stock < 0)
    ) {
      throw new ApiError(
        409,
        "INSUFFICIENT_STOCK",
        "This change would make inventory stock negative.",
      );
    }
    return state;
  });
}

function assertChanged(result: { count: number }) {
  if (!result.count)
    throw new ApiError(404, "NOT_FOUND", "The record no longer exists.");
}
async function ensureMaterial(
  client: Prisma.TransactionClient,
  id: bigint,
  ownerId: bigint,
) {
  if (
    !(await client.rawMaterial.findFirst({
      where: { id, ownerId },
      select: { id: true },
    }))
  )
    throw new ApiError(404, "NOT_FOUND", "The selected record does not exist.");
}
async function ensureProduct(
  client: Prisma.TransactionClient,
  id: bigint,
  ownerId: bigint,
) {
  if (
    !(await client.finishedProduct.findFirst({
      where: { id, ownerId },
      select: { id: true },
    }))
  )
    throw new ApiError(404, "NOT_FOUND", "The selected record does not exist.");
}
async function ensureCustomer(
  client: Prisma.TransactionClient,
  id: bigint,
  ownerId: bigint,
) {
  if (
    !(await client.customer.findFirst({
      where: { id, ownerId },
      select: { id: true },
    }))
  )
    throw new ApiError(404, "NOT_FOUND", "The selected record does not exist.");
}
async function toggleMaterial(
  client: Prisma.TransactionClient,
  id: bigint,
  ownerId: bigint,
) {
  const row = await client.rawMaterial.findFirst({
    where: { id, ownerId },
    select: { active: true },
  });
  if (!row)
    throw new ApiError(404, "NOT_FOUND", "The record no longer exists.");
  await client.rawMaterial.update({
    where: { id },
    data: { active: !row.active, updatedAt: new Date() },
  });
}
async function toggleProduct(
  client: Prisma.TransactionClient,
  id: bigint,
  ownerId: bigint,
) {
  const row = await client.finishedProduct.findFirst({
    where: { id, ownerId },
    select: { active: true },
  });
  if (!row)
    throw new ApiError(404, "NOT_FOUND", "The record no longer exists.");
  await client.finishedProduct.update({
    where: { id },
    data: { active: !row.active, updatedAt: new Date() },
  });
}
async function toggleCustomer(
  client: Prisma.TransactionClient,
  id: bigint,
  ownerId: bigint,
) {
  const row = await client.customer.findFirst({
    where: { id, ownerId },
    select: { active: true },
  });
  if (!row)
    throw new ApiError(404, "NOT_FOUND", "The record no longer exists.");
  await client.customer.update({
    where: { id },
    data: { active: !row.active, updatedAt: new Date() },
  });
}
