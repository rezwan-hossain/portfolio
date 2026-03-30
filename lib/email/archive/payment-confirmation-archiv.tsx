// lib/email/templates/payment-confirmation.ts

interface PaymentEmailProps {
  runnerName: string;
  eventName: string;
  eventDate: string;
  packageName: string;
  distance: string;
  amount: number;
  orderId: string;
  bibNumber?: string;
  appUrl?: string;
}

export function getPaymentConfirmationEmailHTML(
  props: PaymentEmailProps,
): string {
  const {
    runnerName,
    eventName,
    eventDate,
    packageName,
    distance,
    amount,
    orderId,
    bibNumber,
    appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  } = props;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#059669; padding:32px 24px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px;">✅ Registration Confirmed</h1>
              ${bibNumber ? `<p style="margin:16px 0 0; color:#ffffff; font-size:36px; font-weight:bold; letter-spacing:4px; font-family:monospace;">BIB #${bibNumber}</p>` : ""}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 20px; font-size:16px; color:#111827;">
                Hi <strong>${runnerName}</strong>, your registration is confirmed!
              </p>

              <table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px; color:#374151; border-collapse:collapse;">
                <tr>
                  <td style="border-bottom:1px solid #e5e7eb; color:#6b7280; width:40%;">Event</td>
                  <td style="border-bottom:1px solid #e5e7eb; font-weight:600;">${eventName}</td>
                </tr>
                <tr>
                  <td style="border-bottom:1px solid #e5e7eb; color:#6b7280;">Date</td>
                  <td style="border-bottom:1px solid #e5e7eb;">${eventDate}</td>
                </tr>
                <tr>
                  <td style="border-bottom:1px solid #e5e7eb; color:#6b7280;">Package</td>
                  <td style="border-bottom:1px solid #e5e7eb;">${packageName} (${distance})</td>
                </tr>
                <tr>
                  <td style="border-bottom:1px solid #e5e7eb; color:#6b7280;">Order ID</td>
                  <td style="border-bottom:1px solid #e5e7eb; font-family:monospace;">${orderId.slice(0, 8).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;">Amount Paid</td>
                  <td style="font-weight:700; color:#059669; font-size:18px;">৳${amount.toLocaleString()}</td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/profile" style="display:inline-block; padding:14px 32px; background-color:#111827; color:#ffffff; text-decoration:none; font-size:14px; font-weight:600; border-radius:8px;">
                      View Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 24px; background-color:#f9fafb; border-top:1px solid #e5e7eb; text-align:center;">
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                Arrive 30 min early with a valid ID. Don't reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
