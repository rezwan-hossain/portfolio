// lib/shurjopay.ts
import axios, { AxiosError } from "axios";

const BASE_URL = process.env.SHURJOPAY_API_URL!;
const USERNAME = process.env.SHURJOPAY_USERNAME!;
const PASSWORD = process.env.SHURJOPAY_PASSWORD!;
const CALLBACK_URL = process.env.SHURJOPAY_CALLBACK_URL!;
const SHURJOPAY_PREFIX = process.env.SHURJOPAY_PREFIX;

// ─── Types (CORRECTED based on official docs) ──────
export interface ShurjoPayTokenResponse {
  token: string;
  store_id: number;
  execute_url: string;
  token_type: string;
  sp_code: string | number;
  message: string;
}

export interface ShurjoPayPaymentResponse {
  checkout_url: string;
  amount: number;
  currency: string;
  sp_order_id: string;
  customer_order_id: string;
  sp_code: string | number;
  message: string;
  transactionStatus: string;
}

// ✅ CORRECTED: Based on official documentation
export interface ShurjoPayVerificationItem {
  id: number;
  order_id: string; // shurjoPay payment id
  currency: string;
  amount: number;
  payable_amount: number;
  discount_amount: number;
  disc_percent: number;
  received_amount: number;
  usd_amt: number;
  usd_rate: number;
  method: string; // payment method (bKash, cards, etc.)
  sp_code: number; // ✅ KEY FIELD: 1000 = success, 1001 = declined, 1002 = cancelled
  sp_message: string; // Response message
  name: string;
  email: string;
  address: string;
  city: string;
  value1: string;
  value2: string;
  value3: string;
  value4: string;
  // ❌ REMOVED: bank_status, transaction_status, bank_trx_id, invoice_no, customer_order_id
  // These are NOT in the official documentation!

  // ✅ BUT keep these as optional in case sandbox returns them
  bank_status?: string;
  transaction_status?: string;
  bank_trx_id?: string;
  invoice_no?: string;
  customer_order_id?: string;
  date_time?: string;
}

// ─── SP_CODE Constants (from documentation) ─────────
export const SP_CODE = {
  SUCCESS: 1000,
  DECLINED_BY_BANK: 1001,
  CANCELLED_BY_CUSTOMER: 1002,
} as const;

// ─── Get Token ──────────────────────────────────────
export async function getShurjoPayToken(): Promise<ShurjoPayTokenResponse> {
  console.log("🔑 Token request to:", `${BASE_URL}/api/get_token`);
  console.log("🔑 Environment:", process.env.NODE_ENV);

  try {
    const { data } = await axios.post(
      `${BASE_URL}/api/get_token`,
      {
        username: USERNAME,
        password: PASSWORD,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    console.log("🔑 ShurjoPay token response:", {
      token: data.token ? "✅ received" : "❌ missing",
      store_id: data.store_id,
      sp_code: data.sp_code,
      message: data.message,
    });

    if (!data.token) {
      throw new Error(`Token not received: ${data.message || "Unknown error"}`);
    }

    return data as ShurjoPayTokenResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("🔑 Token request failed:", {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      throw new Error(
        `ShurjoPay token error: ${axiosError.response?.status} - ${JSON.stringify(axiosError.response?.data)}`,
      );
    }
    throw error;
  }
}

// ─── Create Payment ─────────────────────────────────
export async function createShurjoPayPayment({
  token,
  storeId,
  orderId,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  customerCity,
  clientIp,
}: {
  token: string;
  storeId: number;
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  customerCity?: string;
  clientIp?: string;
}): Promise<ShurjoPayPaymentResponse> {
  const payload = {
    prefix: SHURJOPAY_PREFIX || "RRN",
    token,
    store_id: storeId,
    return_url: CALLBACK_URL,
    cancel_url: CALLBACK_URL,
    amount: amount,
    order_id: orderId,
    currency: "BDT",
    customer_name: customerName,
    customer_address: customerAddress || "Dhaka",
    customer_city: customerCity || "Dhaka",
    customer_phone: customerPhone,
    customer_email: customerEmail,
    client_ip: clientIp || "127.0.0.1",
    discount_amount: 0,
    disc_percent: 0,
    value1: orderId,
    value2: "",
    value3: "",
    value4: "",
  };

  console.log("💳 ShurjoPay create payment payload:", {
    amount,
    orderId,
    customerName,
    customerPhone,
    return_url: CALLBACK_URL,
    store_id: storeId,
  });

  try {
    const { data } = await axios.post(`${BASE_URL}/api/secret-pay`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    console.log("💳 ShurjoPay create payment response:", {
      checkout_url: data.checkout_url ? "✅ received" : "❌ missing",
      sp_order_id: data.sp_order_id,
      sp_code: data.sp_code,
      message: data.message,
    });

    return data as ShurjoPayPaymentResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("💳 Create payment failed:", {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      throw new Error(
        `ShurjoPay payment error: ${axiosError.response?.status}`,
      );
    }
    throw error;
  }
}

// ─── Verify Payment ─────────────────────────────────
export async function verifyShurjoPayPayment(
  spOrderId: string,
): Promise<ShurjoPayVerificationItem[]> {
  console.log("🔍 Verifying payment for order:", spOrderId);

  const tokenData = await getShurjoPayToken();

  try {
    const { data } = await axios.post(
      `${BASE_URL}/api/verification`,
      { order_id: spOrderId },
      {
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    // ✅ Log raw response for debugging
    console.log(
      "✅ ShurjoPay RAW verify response:",
      JSON.stringify(data, null, 2),
    );

    // Handle different response structures
    let verificationData: ShurjoPayVerificationItem[];

    if (Array.isArray(data)) {
      verificationData = data;
    } else if (data && Array.isArray(data.data)) {
      verificationData = data.data;
    } else if (data && typeof data === "object" && data.order_id) {
      verificationData = [data];
    } else {
      console.error("❌ Unexpected verification response structure:", data);
      verificationData = [];
    }

    // ✅ Log parsed data with sp_code focus
    console.log("✅ Parsed verification data:", {
      count: verificationData.length,
      firstItem: verificationData[0]
        ? {
            sp_code: verificationData[0].sp_code,
            sp_code_type: typeof verificationData[0].sp_code,
            sp_message: verificationData[0].sp_message,
            method: verificationData[0].method,
            amount: verificationData[0].amount,
            received_amount: verificationData[0].received_amount,
          }
        : null,
    });

    return verificationData;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("🔍 Verification failed:", {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      throw new Error(
        `ShurjoPay verification error: ${axiosError.response?.status}`,
      );
    }
    throw error;
  }
}

// ✅ CORRECTED: Check success using sp_code ONLY (per documentation)
export function isPaymentSuccessful(
  paymentInfo: ShurjoPayVerificationItem,
): boolean {
  const spCode = Number(paymentInfo.sp_code);

  console.log("🔍 Checking payment success:", {
    sp_code: paymentInfo.sp_code,
    sp_code_as_number: spCode,
    sp_message: paymentInfo.sp_message,
    is_success: spCode === SP_CODE.SUCCESS,
  });

  // ✅ PRIMARY CHECK: sp_code === 1000
  return spCode === SP_CODE.SUCCESS;
}

// ✅ CORRECTED: Check cancelled using sp_code
export function isPaymentCancelled(
  paymentInfo: ShurjoPayVerificationItem,
): boolean {
  const spCode = Number(paymentInfo.sp_code);

  // sp_code 1002 = cancelled by customer
  return spCode === SP_CODE.CANCELLED_BY_CUSTOMER;
}

// ✅ CORRECTED: Check declined/failed using sp_code
export function isPaymentDeclined(
  paymentInfo: ShurjoPayVerificationItem,
): boolean {
  const spCode = Number(paymentInfo.sp_code);

  // sp_code 1001 = declined by bank
  return spCode === SP_CODE.DECLINED_BY_BANK;
}

// ✅ NEW: Check if payment failed (any non-success code)
export function isPaymentFailed(
  paymentInfo: ShurjoPayVerificationItem,
): boolean {
  const spCode = Number(paymentInfo.sp_code);

  // Any code other than 1000 is a failure
  return spCode !== SP_CODE.SUCCESS;
}

// ✅ NEW: Get human-readable status
export function getPaymentStatusMessage(
  paymentInfo: ShurjoPayVerificationItem,
): string {
  const spCode = Number(paymentInfo.sp_code);

  switch (spCode) {
    case 1000:
      return "Payment successful";
    case 1001:
      return "Transaction declined by bank";
    case 1002:
      return "Transaction cancelled by customer";
    default:
      return paymentInfo.sp_message || `Unknown status (code: ${spCode})`;
  }
}
