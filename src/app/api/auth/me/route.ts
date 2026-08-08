import { apiFailure, apiSuccess } from "@/server/api-error";
import { requireSession } from "@/server/auth";

export async function GET() {
  try {
    const { name, email } = await requireSession();
    return apiSuccess({ user: { name, email } });
  } catch (error) {
    return apiFailure(error);
  }
}
