// lib/shurjopay/client.ts

import axios, { type RawAxiosRequestHeaders } from "axios";
import { config } from "./config";
import { ShurjoPayError } from "./errors";

const TIMEOUT_MS = 50_000;

// ─── Reusable Axios Instance ────────────────────────
export const httpClient = axios.create({
  baseURL: config.baseUrl,
  timeout: TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

// ─── Error Normalizer ───────────────────────────────
export function handleAxiosError(
  error: unknown,
  ErrorClass: new (status?: number, data?: unknown) => ShurjoPayError,
): never {
  if (axios.isAxiosError(error)) {
    // ✅ No cast needed — isAxiosError() already narrows the type
    throw new ErrorClass(error.response?.status, error.response?.data);
  }

  // ✅ Wrap ALL unexpected errors (network, timeout, parse, etc.)
  // so callers always receive a ShurjoPayError, never a raw unknown
  const message = error instanceof Error ? error.message : "Unexpected error";
  throw new ErrorClass(undefined, { originalError: message });
}

// ─── Auth Header Helper ─────────────────────────────
// ✅ RawAxiosRequestHeaders replaces deprecated AxiosRequestConfig["headers"]
export function bearerHeader(token: string): RawAxiosRequestHeaders {
  return { Authorization: `Bearer ${token}` };
}
