import { z } from "zod";
import { cookies } from "next/headers";
import { apiFailure, apiSuccess, ApiError, readJson } from "@/server/api-error";
import { comparePassword, createToken, sessionCookie } from "@/server/auth";
import { prisma } from "@/server/db";

const schema = z.object({
  email: z.email().trim().toLowerCase().max(320),
  password: z.string().min(1).max(128),
  remember: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await readJson(request));
    const owner = await prisma.owner.findUnique({ where: { email: input.email } });
    if (!owner || !(await comparePassword(input.password, owner.passwordHash)))
      throw new ApiError(
        401,
        "INVALID_CREDENTIALS",
        "Email or password is incorrect.",
      );
    const user = {
      ownerId: Number(owner.id),
      name: owner.name,
      email: owner.email,
    };
    (await cookies()).set(
      sessionCookie(createToken(user, input.remember), input.remember),
    );
    return apiSuccess({ user: { name: user.name, email: user.email } });
  } catch (error) {
    return apiFailure(error);
  }
}
