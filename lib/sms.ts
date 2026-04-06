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
    bibText,
    tshirtText,
    ``,
    `Thanks from Merch Sports`,
  ]
    .filter(Boolean)
    .join("\n");
}
