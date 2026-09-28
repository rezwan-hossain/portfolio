// lib/sms.ts
interface SendSMSParams {
  number: string;
  message: string;
  senderid?: string;
}

interface SMSResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// The gateway answers HTTP 200 even when it rejects a message; the real
// result is `response_code` in the body (BulkSMSBD-style API: 202 = accepted).
const SMS_ACCEPTED = 202;
const SMS_ERRORS: Record<number, string> = {
  1001: "invalid number",
  1002: "sender ID not correct or disabled",
  1003: "required fields missing",
  1005: "gateway internal error",
  1006: "balance validity not available",
  1007: "balance insufficient",
  1011: "user ID not found",
  1012: "masking SMS must be sent in Bengali",
  1013: "sender ID has no gateway for this API key",
  1014: "sender type name not found for this sender",
  1015: "sender ID has no valid gateway",
  1016: "sender type active price info not found",
  1017: "sender type price info not found",
  1018: "account disabled",
  1019: "sender type price disabled",
  1020: "parent account not found",
  1021: "parent active sender type price not found",
  1031: "account not verified",
  1032: "IP not whitelisted",
};

/**
 * Decide whether the gateway really accepted the SMS.
 * - response_code 202 → accepted
 * - any other response_code → rejected (with the gateway's reason)
 * - no response_code at all → unknown format; treated as accepted, as before,
 *   so a different provider's reply never turns working SMS into "failed".
 */
export function interpretSmsReply(data: unknown): { ok: boolean; error?: string } {
  if (!data || typeof data !== "object") return { ok: true };
  const d = data as Record<string, unknown>;
  if (d.response_code === undefined || d.response_code === null) return { ok: true };
  const code = Number(d.response_code);
  if (code === SMS_ACCEPTED) return { ok: true };
  const reason =
    (typeof d.error_message === "string" && d.error_message.trim()) ||
    SMS_ERRORS[code] ||
    "rejected by the SMS gateway";
  return { ok: false, error: `SMS gateway rejected it (code ${d.response_code}): ${reason}` };
}

export async function sendSMS({
  number,
  message,
  senderid = process.env.SMS_SENDER_ID || "DEFAULT",
}: SendSMSParams): Promise<SMSResponse> {
  try {
    const response = await fetch(
      process.env.SMS_API_URL || "http://139.99.39.237/api/smsapi",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: process.env.SMS_API_KEY,
          senderid,
          number,
          message,
        }),
        // Never let a hung gateway stall confirmations.
        signal: AbortSignal.timeout(15_000),
      },
    );

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`SMS API error: ${text}`);
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Unexpected SMS gateway reply: ${text.slice(0, 200)}`);
    }

    const verdict = interpretSmsReply(data);
    if (!verdict.ok) {
      console.error("❌ SMS rejected by gateway:", verdict.error);
      return { success: false, error: verdict.error, data };
    }
    return { success: true, data };
  } catch (error: any) {
    console.error("❌ SMS sending failed:", error?.message);
    return { success: false, error: error?.message };
  }
}

// Helper to format phone number for Bangladesh
export function formatBDPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    return "880" + cleaned.slice(1);
  }

  if (cleaned.startsWith("880")) {
    return cleaned;
  }

  if (cleaned.startsWith("88")) {
    return "880" + cleaned.slice(2);
  }

  return "880" + cleaned;
}

// Template for payment confirmation SMS
export function getPaymentConfirmationSMS({
  runnerName,
  eventName,
  bibNumber,
  tshirtSize,
}: {
  runnerName: string;
  eventName: string;
  bibNumber?: string;
  tshirtSize?: string;
}): string {
  const bibText = bibNumber ? `Your BIB is:${bibNumber}.` : "";
  const tshirtText = tshirtSize ? `T-shirt size:${tshirtSize}.` : "";

  return [
    `Hi ${runnerName}!`,
    `Welcome to ${eventName}.`,
    // bibText,
    tshirtText,
    ``,
    `Thanks from Merch Sports`,
  ]
    .filter(Boolean)
    .join("\n");
}
