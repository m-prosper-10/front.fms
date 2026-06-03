import { appConfig } from "./config";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

function buildUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, appConfig.apiBaseUrl).toString();
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
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

    throw new Error(message);
  }

  if (typeof body === "object" && body && "data" in body) {
    return (body as ApiEnvelope<T>).data as T;
  }

  return body as T;
}
