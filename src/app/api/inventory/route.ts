import { apiFailure, apiSuccess } from "@/server/api-error";
import { requireSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { loadInventory } from "@/server/inventory-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession();
    return apiSuccess(await loadInventory(prisma, session.ownerId));
  } catch (error) {
    return apiFailure(error);
  }
}
