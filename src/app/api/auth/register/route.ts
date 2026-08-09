import { z } from "zod";
import { apiFailure, apiSuccess, ApiError, readJson } from "@/server/api-error";
import { hashPassword } from "@/server/auth";
import { prisma } from "@/server/db";

const schema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.email().trim().toLowerCase().max(320),
    password: z
      .string()
      .min(8)
      .max(128)
      .regex(/[A-Za-z]/)
      .regex(/[0-9]/),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export async function POST(request: Request) {
  try {
    const input = schema.parse(await readJson(request));
    const existingOwner = await prisma.owner.findUnique({
      where: { email: input.email },
      select: { id: true },
    });
    if (existingOwner)
      throw new ApiError(
        409,
        "EMAIL_EXISTS",
        "An account with this email already exists.",
      );

    const passwordHash = await hashPassword(input.password);
    await prisma.owner.create({
      data: { name: input.name, email: input.email, passwordHash },
    });
    return apiSuccess({ message: "Owner account created." }, 201);
  } catch (error) {
    return apiFailure(error);
  }
}
