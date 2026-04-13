// lib/shurjopay/types.ts

// ─── SP Code Constants ──────────────────────────────
export const SP_CODE = {
  SUCCESS: 1000,
  DECLINED_BY_BANK: 1001,
  CANCELLED_BY_CUSTOMER: 1002,
} as const;

export type SpCode = (typeof SP_CODE)[keyof typeof SP_CODE];

// ─── API Response Types ─────────────────────────────
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

export interface ShurjoPayVerificationItem {
  id: number;
  order_id: string;
  currency: string;
  amount: number;
  payable_amount: number;
  discount_amount: number;
  disc_percent: number;
  received_amount: number;
  usd_amt: number;
  usd_rate: number;
  method: string;
  sp_code: number;
  sp_message: string;
  name: string;
  email: string;
  address: string;
  city: string;
  value1: string;
  value2: string;
  value3: string;
  value4: string;
  // Optional: only present in sandbox
  bank_status?: string;
  transaction_status?: string;
  bank_trx_id?: string;
  invoice_no?: string;
  customer_order_id?: string;
  date_time?: string;
}

// ─── Input Types ────────────────────────────────────
export interface CreatePaymentInput {
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
}
