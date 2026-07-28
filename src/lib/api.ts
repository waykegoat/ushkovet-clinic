const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

export const isStaticDemo = import.meta.env.VITE_STATIC_DEMO === "true";

export function apiUrl(path: string): string {
  return `${configuredBaseUrl}${path}`;
}
