type ErrorPayload = {
  success?: false;
  error?: { code?: string; message?: string; details?: unknown };
};

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function getErrorMessage(reason: unknown, fallback: string) {
  return typeof reason === "object" &&
    reason !== null &&
    "message" in reason &&
    typeof reason.message === "string"
    ? reason.message
    : fallback;
}

export function getErrorStatus(reason: unknown) {
  return typeof reason === "object" &&
    reason !== null &&
    "status" in reason &&
    typeof reason.status === "number"
    ? reason.status
    : undefined;
}

export async function apiRequest<T>(url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    credentials: "same-origin",
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as
    { success: true; data: T } | ErrorPayload | null;
  if (!response.ok || !payload || payload.success !== true) {
    const failure = payload as ErrorPayload | null;
    throw new ApiClientError(
      response.status,
      failure?.error?.code ?? "REQUEST_FAILED",
      failure?.error?.message ?? "The request could not be completed.",
      failure?.error?.details,
    );
  }
  return payload.data;
}
