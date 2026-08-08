import { apiFailure, apiSuccess, readJson } from "@/server/api-error";
import { requireSession } from "@/server/auth";
import { mutateInventory } from "@/server/inventory-repository";
import { inventoryActionSchema } from "@/server/inventory-schemas";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const action = inventoryActionSchema.parse(await readJson(request));
    return apiSuccess(await mutateInventory(session.ownerId, action));
  } catch (error) {
    return apiFailure(error);
  }
}
