import { appConfig } from "./config";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(status: number, message: string, details: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function buildUrl(baseUrl: string, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedBase = baseUrl.replace(/\/+$/, "");

  if (/^https?:\/\//.test(normalizedBase)) {
    return new URL(normalizedPath, normalizedBase).toString();
  }

  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";

  return new URL(`${normalizedBase}${normalizedPath}`, origin).toString();
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  return requestJson(appConfig.apiBaseUrl, path, init);
}

export async function requestJson<T>(
  baseUrl: string,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(baseUrl, path), {
    ...init,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? ((await response.json()) as ApiEnvelope<T> | T)
    : ((await response.text()) as T);

  if (!response.ok) {
    const message =
      typeof body === "object" && body && "message" in body
        ? String((body as ApiEnvelope<T>).message || response.statusText)
        : response.statusText || "Request failed";

    const details =
      typeof body === "object" && body && "details" in body
        ? (body as Record<string, unknown>).details
        : null;

    throw new ApiError(response.status, message, details);
  }

  if (typeof body === "object" && body && "data" in body) {
    return (body as ApiEnvelope<T>).data as T;
  }

  return body as T;
}
