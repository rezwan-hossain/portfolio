// lib/email/templates/payment-confirmation.ts

interface PaymentConfirmationEmailProps {
  runnerName: string;
  eventName: string;
  eventDate: string;
  packageName: string;
  distance: string;
  amount: number;
  orderId: string;
  bibNumber?: string;
  qrCodeUrl?: string;
  appUrl?: string;
}

export function getPaymentConfirmationEmailHTML({
  runnerName = "Runner",
  eventName = "Marathon Event",
  eventDate = "TBD",
  packageName = "Standard Package",
  distance = "10K",
  amount = 0,
  orderId = "ORDER-XXX",
  bibNumber,
  qrCodeUrl,
  appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
}: PaymentConfirmationEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Registration Confirmed!</h1>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px;">
        
        <!-- Success Badge -->
        <div style="margin-bottom: 20px;">
          <span style="background-color: #10b981; color: white; display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px;">✓ PAYMENT SUCCESSFUL</span>
        </div>

        <h2 style="color: #111827; margin: 0 0 16px 0;">Hi ${runnerName},</h2>
        <p style="color: #4b5563; margin: 0 0 24px 0;">
          Thank you for registering for <strong>${eventName}</strong>! Your payment has been confirmed and your spot is secured.
        </p>

        ${
          bibNumber
            ? `
        <!-- BIB Number -->
        <div style="margin: 30px 0;">
          <h3 style="color: #374151; margin: 0 0 12px 0; font-size: 16px;">Your BIB Number</h3>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 48px; font-weight: bold; text-align: center; padding: 30px; border-radius: 12px; letter-spacing: 4px;">
            #${bibNumber}
          </div>
          <p style="text-align: center; color: #6b7280; margin: 12px 0 0 0; font-size: 14px;">
            Please remember this number for race day!
          </p>
        </div>
        `
            : ""
        }

        <!-- Event Details -->
        <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 16px;">Event Details</h3>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600; width: 40%;">Event:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500;">${eventName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600;">Date:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500;">${eventDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600;">Package:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500;">${packageName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Distance:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;">${distance}</td>
            </tr>
          </table>
        </div>

        <!-- Payment Details -->
        <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 16px;">Payment Details</h3>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600; width: 40%;">Order ID:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500; font-family: monospace; font-size: 12px;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600;">Amount Paid:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500;">৳${amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Payment Status:</td>
              <td style="padding: 8px 0; color: #10b981; font-weight: bold;">PAID ✓</td>
            </tr>
          </table>
        </div>

        ${
          qrCodeUrl
            ? `
        <!-- QR Code -->
        <div style="text-align: center; margin: 30px 0;">
          <h3 style="color: #374151; margin: 0 0 12px 0;">Your Registration QR Code</h3>
          <img src="${qrCodeUrl}" alt="Registration QR Code" style="max-width: 200px; border: 2px solid #e5e7eb; border-radius: 8px; padding: 10px;" />
          <p style="color: #6b7280; font-size: 14px; margin: 12px 0 0 0;">
            Show this QR code at the event check-in
          </p>
        </div>
        `
            : ""
        }

        <!-- Next Steps -->
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px;">📋 Next Steps</h3>
          <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
            <li style="margin-bottom: 8px;">Save this email for your records</li>
            <li style="margin-bottom: 8px;">Arrive at the venue 30 minutes before the event</li>
            <li style="margin-bottom: 8px;">Bring a valid ID for verification</li>
            <li>Check your dashboard for event updates</li>
          </ul>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/profile" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
            View My Dashboard
          </a>
        </div>

        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          If you have any questions, please contact us at 
          <a href="mailto:support@yourapp.com" style="color: #667eea;">support@yourapp.com</a>
        </p>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f9fafb; padding: 30px; text-align: center;">
        <p style="margin: 0 0 8px 0; color: #374151; font-weight: bold;">Your Marathon Platform</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          This is an automated confirmation email. Please do not reply.
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
  `.trim();
}
