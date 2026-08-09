import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function apiFailure(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status },
    );
  }
  if (error instanceof ZodError) {
    return Response.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "The request contains invalid values.",
          details: error.flatten(),
        },
      },
      { status: 400 },
    );
  }
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
    return Response.json(
      {
        success: false,
        error: {
          code: "CONFLICT",
          message: "A record with that unique value already exists.",
        },
      },
      { status: 409 },
    );
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  )
    return Response.json(
      {
        success: false,
        error: {
          code: "RECORD_IN_USE",
          message: "This record has transaction history and cannot be deleted.",
        },
      },
      { status: 409 },
    );
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  )
    return Response.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "The requested record no longer exists.",
        },
      },
      { status: 404 },
    );
  console.error("Unhandled API error", error);
  return Response.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected server error occurred.",
      },
    },
    { status: 500 },
  );
}

export async function readJson(request: Request) {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .includes("application/json")
  ) {
    throw new ApiError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Content-Type must be application/json.",
    );
  }
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 100_000)
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
  try {
    return await request.json();
  } catch {
    throw new ApiError(
      400,
      "INVALID_JSON",
      "Request body must contain valid JSON.",
    );
  }
}
