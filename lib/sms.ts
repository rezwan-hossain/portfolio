// lib/sms.ts
interface SendSMSParams {
  number: string; // Single number or comma-separated
  message: string;
  senderid?: string;
}

interface SMSResponse {
  success: boolean;
  data?: any;
  error?: string;
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
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SMS API error: ${errorText}`);
    }

    const data = await response.json();

    return { success: true, data };
  } catch (error: any) {
    console.error("❌ SMS sending failed:", error?.message);
    return { success: false, error: error?.message };
  }
}

// Helper to format phone number for Bangladesh
export function formatBDPhone(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // 1. Local format: 01XXXXXXXXX → 8801XXXXXXXXX
  if (cleaned.startsWith("0")) {
    return "880" + cleaned.slice(1);
  }

  // 2. Already correct: 8801XXXXXXXXX
  if (cleaned.startsWith("880")) {
    return cleaned;
  }

  // 3. Country code without 0: 881XXXXXXXXX → 8801XXXXXXXXX
  if (cleaned.startsWith("88")) {
    return "880" + cleaned.slice(2);
  }

  // 4. Fallback: assume local number without leading 0
  return "880" + cleaned;
}

// Template for payment confirmation SMS
export function getPaymentConfirmationSMS({
  runnerName,
  eventName,
  bibNumber,
  amount,
  orderId,
}: {
  runnerName: string;
  eventName: string;
  bibNumber?: string;
  amount: number;
  orderId: string;
}): string {
  const bibText = bibNumber ? ` BIB: ${bibNumber}.` : "";
  return `Hi ${runnerName}! Payment confirmed for ${eventName}.${bibText} Amount: BDT ${amount}. Order: ${orderId}. See you at the race!`;
}
