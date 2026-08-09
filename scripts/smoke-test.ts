import { loadEnvConfig } from "@next/env";
import type { InventoryState } from "../src/types/inventory";

loadEnvConfig(process.cwd());

const base = process.env.SMOKE_BASE_URL ?? "http://localhost:3100";
const runId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const email = `stockflow-smoke-${runId}@example.invalid`;
const secondEmail = `stockflow-smoke-second-${runId}@example.invalid`;
const password = "SmokeTest1234";
let cookie = "";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: { message?: string };
};

class RequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, method = "GET", body?: unknown) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";", 1)[0];
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success) {
    throw new RequestError(
      response.status,
      `${method} ${path}: ${response.status} ${payload.error?.message ?? "failed"}`,
    );
  }
  return payload.data;
}

const action = (type: string, payload: unknown) =>
  request<InventoryState>("/api/inventory/actions", "POST", { type, payload });
const expect = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

async function main() {
  const { prisma } = await import("../src/server/db");
  try {
    await request<{ message: string }>("/api/auth/register", "POST", {
      name: "Smoke Test Owner",
      email,
      password,
      confirmPassword: password,
    });
    await request<{ message: string }>("/api/auth/register", "POST", {
      name: "Second Smoke Test Owner",
      email: secondEmail,
      password,
      confirmPassword: password,
    });
    await request<{ user: { name: string; email: string } }>(
      "/api/auth/login",
      "POST",
      {
        email,
        password,
        remember: false,
      },
    );
    let state = await request<InventoryState>("/api/inventory");
    expect(
      state.rawMaterials.length === 0,
      "New owner inventory was not empty.",
    );
    state = await action("material.create", {
      name: "Flour",
      sku: "TEST-RM",
      unit: "kg",
      openingStock: 5,
      reorderLevel: 1,
      unitCost: 2,
      active: true,
    });
    const firstOwnerMaterialId = state.rawMaterials[0].id;

    cookie = "";
    await request<{ user: { name: string; email: string } }>(
      "/api/auth/login",
      "POST",
      { email: secondEmail, password, remember: false },
    );
    const secondOwnerState = await request<InventoryState>("/api/inventory");
    expect(
      secondOwnerState.rawMaterials.length === 0,
      "A second owner could read the first owner's inventory.",
    );
    try {
      await action("material.toggle", { id: firstOwnerMaterialId });
      throw new Error("A second owner could modify the first owner's data.");
    } catch (error) {
      expect(
        error instanceof RequestError && error.status === 404,
        "Cross-owner mutation did not return a not-found response.",
      );
    }

    cookie = "";
    await request<{ user: { name: string; email: string } }>(
      "/api/auth/login",
      "POST",
      { email, password, remember: false },
    );
    state = await request<InventoryState>("/api/inventory");
    expect(
      state.rawMaterials.length === 1 &&
        state.rawMaterials[0].id === firstOwnerMaterialId,
      "The first owner's inventory was not preserved after switching accounts.",
    );

    state = await action("material.update", {
      id: firstOwnerMaterialId,
      name: "Updated Flour",
      sku: "TEST-RM",
      unit: "kg",
      openingStock: 5,
      reorderLevel: 2,
      unitCost: 2.5,
      active: true,
    });
    expect(
      state.rawMaterials[0]?.name === "Updated Flour" &&
        state.rawMaterials[0]?.reorderLevel === 2,
      "The update response did not include the latest material.",
    );
    state = await action("material.create", {
      name: "Temporary Material",
      sku: "TEST-TEMP",
      unit: "kg",
      openingStock: 1,
      reorderLevel: 0,
      unitCost: 1,
      active: true,
    });
    const temporaryMaterialId = state.rawMaterials.find(
      (item) => item.sku === "TEST-TEMP",
    )?.id;
    expect(
      temporaryMaterialId !== undefined,
      "The create response did not include the new material.",
    );
    state = await action("material.delete", { id: temporaryMaterialId });
    expect(
      !state.rawMaterials.some((item) => item.id === temporaryMaterialId),
      "The delete response still included the removed material.",
    );

    state = await action("product.create", {
      name: "Bread",
      sku: "TEST-FG",
      unit: "pcs",
      openingStock: 0,
      reorderLevel: 1,
      salePrice: 6,
      active: true,
    });
    state = await action("customer.create", {
      name: "Test Customer",
      phone: "123",
      email: "customer@example.invalid",
      active: true,
    });
    const materialId = state.rawMaterials[0].id;
    const productId = state.finishedProducts[0].id;
    const customerId = state.customers[0].id;
    const date = new Date().toISOString();
    state = await action("purchase.create", {
      supplier: "Test Supplier",
      materialId,
      quantity: 10,
      unitCost: 2,
      date,
    });
    state = await action("production.create", {
      materialId,
      materialQuantity: 4,
      productId,
      productQuantity: 8,
      date,
    });
    state = await action("sale.create", {
      customerId,
      productId,
      quantity: 2,
      unitPrice: 6,
      payment: 5,
      date,
    });
    state = await action("return.create", {
      customerId,
      productId,
      quantity: 1,
      unitPrice: 6,
      date,
    });
    state = await action("payment.create", { customerId, amount: 1, date });
    expect(
      state.rawMaterials[0].stock === 11,
      "Raw material stock was not reconciled.",
    );
    expect(
      state.finishedProducts[0].stock === 7,
      "Finished product stock was not reconciled.",
    );
    expect(
      state.ledger.reduce((sum, row) => sum + row.debit - row.credit, 0) === 0,
      "Customer ledger was not reconciled.",
    );
    expect(
      state.stockMovements.length === 5,
      "Stock movement history is incomplete.",
    );
    console.log(
      "Multi-owner isolation, authentication, Prisma CRUD, stock, and ledger smoke tests passed.",
    );
  } finally {
    await prisma.owner.deleteMany({
      where: { email: { in: [email, secondEmail] } },
    });
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
