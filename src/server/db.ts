import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@/generated/prisma/client";
import { env } from "./env";

const globalForPrisma = globalThis as typeof globalThis & {
  stockflowPrisma?: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: env().DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

export const prisma =
  globalForPrisma.stockflowPrisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.stockflowPrisma = prisma;
}

export type PrismaExecutor = PrismaClient | Prisma.TransactionClient;

export function transaction<T>(
  work: (client: Prisma.TransactionClient) => Promise<T>,
) {
  return prisma.$transaction(work, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    maxWait: 10_000,
    timeout: 20_000,
  });
}
