// lib/shurjopay.ts
import axios from "axios";

const BASE_URL = process.env.SHURJOPAY_API_URL!;
const USERNAME = process.env.SHURJOPAY_USERNAME!;
const PASSWORD = process.env.SHURJOPAY_PASSWORD!;
const CALLBACK_URL = process.env.SHURJOPAY_CALLBACK_URL!;

// ─── Get Token ──────────────────────────────────────
export async function getShurjoPayToken() {
  console.log("🔑 Token request to:", `${BASE_URL}/api/get_token`);
  console.log("🔑 Username:", USERNAME);

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
    },
  );

  console.log("🔑 ShurjoPay token response:", {
    token: data.token ? "✅ received" : "❌ missing",
    store_id: data.store_id,
    message: data.message,
  });

  return data as {
    token: string;
    store_id: number;
    execute_url: string;
    token_type: string;
    sp_code: string;
    message: string;
  };
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
}) {
  const payload = {
    prefix: "RRN",
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
    client_ip: "127.0.0.1",
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
  });

  const { data } = await axios.post(`${BASE_URL}/api/secret-pay`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  console.log("💳 ShurjoPay create payment response:", {
    checkout_url: data.checkout_url ? "✅ received" : "❌ missing",
    sp_order_id: data.sp_order_id,
    message: data.message,
  });

  return data as {
    checkout_url: string;
    amount: number;
    currency: string;
    sp_order_id: string;
    customer_order_id: string;
    sp_code: string;
    message: string;
    transactionStatus: string;
  };
}

// ─── Verify Payment ─────────────────────────────────
export async function verifyShurjoPayPayment(spOrderId: string) {
  // Get fresh token for verification
  const tokenData = await getShurjoPayToken();

  const { data } = await axios.post(
    `${BASE_URL}/api/verification`,
    { order_id: spOrderId },
    {
      headers: {
        Authorization: `Bearer ${tokenData.token}`,
        "Content-Type": "application/json",
      },
    },
  );

  console.log("✅ ShurjoPay verify response:", JSON.stringify(data, null, 2));

  return data as Array<{
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
    bank_trx_id: string;
    invoice_no: string;
    bank_status: string;
    customer_order_id: string;
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
    transaction_status: string;
    method: string;
    date_time: string;
  }>;
}
