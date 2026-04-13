// lib/shurjopay/index.ts

import { config } from "./config";
import { httpClient, handleAxiosError, bearerHeader } from "./client";
import {
  ShurjoPayTokenError,
  ShurjoPayPaymentError,
  ShurjoPayVerificationError,
} from "./errors";
import type {
  ShurjoPayTokenResponse,
  ShurjoPayPaymentResponse,
  ShurjoPayVerificationItem,
  CreatePaymentInput,
} from "./types";

// ─── Get Token ──────────────────────────────────────
export async function getShurjoPayToken(): Promise<ShurjoPayTokenResponse> {
  let data: ShurjoPayTokenResponse;

  // ✅ FIX #2: Token validation is now OUTSIDE the try/catch so a missing
  // token throws ShurjoPayTokenError directly instead of being swallowed
  // by the catch block and re-wrapped as an "unexpected error"
  try {
    const response = await httpClient.post<ShurjoPayTokenResponse>(
      "/api/get_token",
      { username: config.username, password: config.password },
    );
    data = response.data;
  } catch (error) {
    return handleAxiosError(error, ShurjoPayTokenError); // ✅ FIX #3: return never
  }

  if (!data.token) {
    throw new ShurjoPayTokenError(undefined, data);
  }

  return data;
}

// ─── Create Payment ─────────────────────────────────
export async function createShurjoPayPayment(
  input: CreatePaymentInput,
): Promise<ShurjoPayPaymentResponse> {
  const {
    token,
    storeId,
    orderId,
    amount,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress = "Dhaka",
    customerCity = "Dhaka",
    clientIp = "127.0.0.1",
  } = input;

  const payload = {
    prefix: config.prefix,
    token,
    store_id: storeId,
    return_url: config.callbackUrl,
    cancel_url: config.callbackUrl,
    amount,
    order_id: orderId,
    currency: "BDT",
    customer_name: customerName,
    customer_address: customerAddress,
    customer_city: customerCity,
    customer_phone: customerPhone,
    customer_email: customerEmail,
    client_ip: clientIp,
    discount_amount: 0,
    disc_percent: 0,
    value1: orderId,
    value2: "",
    value3: "",
    value4: "",
  };

  try {
    const { data } = await httpClient.post<ShurjoPayPaymentResponse>(
      "/api/secret-pay",
      payload,
      { headers: bearerHeader(token) },
    );

    return data;
  } catch (error) {
    return handleAxiosError(error, ShurjoPayPaymentError); // ✅ FIX #3: return never
  }
}

// ─── Verify Payment ─────────────────────────────────
export async function verifyShurjoPayPayment(
  spOrderId: string,
): Promise<ShurjoPayVerificationItem[]> {
  const { token } = await getShurjoPayToken();

  try {
    const { data } = await httpClient.post(
      "/api/verification",
      { order_id: spOrderId },
      { headers: bearerHeader(token) },
    );

    return normalizeVerificationResponse(data);
  } catch (error) {
    return handleAxiosError(error, ShurjoPayVerificationError); // ✅ FIX #3: return never
  }
}

// ─── Private: Normalize Verification Response ───────
function normalizeVerificationResponse(
  data: unknown,
): ShurjoPayVerificationItem[] {
  if (Array.isArray(data)) {
    return data as unknown as ShurjoPayVerificationItem[];
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    if (Array.isArray(obj.data)) {
      // ✅ FIX #4: cast through unknown first
      return obj.data as unknown as ShurjoPayVerificationItem[];
    }

    if (obj.order_id) {
      // ✅ FIX #1: cast through unknown first — required when types don't
      // overlap sufficiently for a direct cast
      return [obj as unknown as ShurjoPayVerificationItem];
    }
  }

  console.warn("⚠️ Unexpected ShurjoPay verification response shape:", data);
  return [];
}

// ─── Re-export everything for consumers ─────────────
export * from "./types";
export * from "./errors";
export * from "./helpers";
