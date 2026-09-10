// lib/email/templates/payment-confirmation.ts

export interface PaymentConfirmationEmailProps {
  runnerName: string;
  eventName: string;
  eventDate: string;
  eventAddress: string;
  packageName: string;
  distance: string;
  amount: number;
  orderId: string;
  orderDate: string;
  orderStatus: string;
  paymentStatus: string;
  transactionId?: string;
  paymentMethod?: string;
  bibNumber?: string;
  tshirtSize?: string;
  bloodGroup?: string;
  appUrl?: string;
}

const MONO_FONT = "'SF Mono', Monaco, 'Courier New', monospace";
const HAIRLINE = "1px solid #f3f4f6";

interface DetailCellOptions {
  icon: string;
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
  valueSize?: string;
  badge?: string;
}

/**
 * A single "icon + label + value" detail item (an inner table so two can sit
 * side by side inside a row). Centralising the markup here means every cell
 * shares the same icon background, spacing and typography.
 */
function detailCell({
  icon,
  label,
  value,
  mono = false,
  capitalize = false,
  valueSize = "14px",
  badge,
}: DetailCellOptions): string {
  const valueStyle = [
    `margin: 4px 0 0 0`,
    `font-size: ${valueSize}`,
    `font-weight: 600`,
    `color: #111827`,
    mono ? `font-family: ${MONO_FONT}` : "",
    capitalize ? `text-transform: capitalize` : "",
  ]
    .filter(Boolean)
    .join("; ");

  return `
    <table role="presentation" cellspacing="0" cellpadding="0">
      <tr>
        <td style="width: 32px; height: 32px; background-color: #f3f4f6; border-radius: 8px; text-align: center; vertical-align: middle;">
          <span style="font-size: 14px;">${icon}</span>
        </td>
        <td style="padding-left: 10px; vertical-align: top;">
          <p style="margin: 0; font-size: 10px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">${label}</p>
          <p style="${valueStyle};">${value}</p>
          ${
            badge
              ? `<span style="display: inline-block; margin-top: 4px; padding: 2px 8px; font-size: 10px; font-weight: 700; background-color: #e0e7ff; color: #4f46e5; border-radius: 4px;">${badge}</span>`
              : ""
          }
        </td>
      </tr>
    </table>`;
}

/**
 * Lays out up to two detail cells as a row.
 *  - both present  -> 50 / 50
 *  - one present   -> full width (no empty half)
 *  - none present  -> row is omitted entirely (no stray divider, no "undefined")
 */
function detailRow(left?: string, right?: string): string {
  const cells = [left, right].filter((c): c is string => Boolean(c));
  if (cells.length === 0) return "";

  const rowStyle = `margin-bottom: 20px; padding-bottom: 20px; border-bottom: ${HAIRLINE};`;

  const tds =
    cells.length === 1
      ? `<td width="100%" style="vertical-align: top;">${cells[0]}</td>`
      : `<td width="50%" style="vertical-align: top; padding-right: 12px;">${cells[0]}</td>
         <td width="50%" style="vertical-align: top; padding-left: 12px;">${cells[1]}</td>`;

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="${rowStyle}">
      <tr>
        ${tds}
      </tr>
    </table>`;
}

function statusBadge(label: string, active: boolean): string {
  const bg = active ? "#ecfdf5" : "#f3f4f6";
  const color = active ? "#059669" : "#6b7280";
  const border = active ? "#a7f3d0" : "#e5e7eb";
  return `<span style="display: inline-block; padding: 6px 12px; font-size: 11px; font-weight: 600; background-color: ${bg}; color: ${color}; border: 1px solid ${border}; border-radius: 20px;">${
    active ? "● " : ""
  }${label}</span>`;
}

export function getPaymentConfirmationEmailHTML({
  runnerName = "Runner",
  eventName = "Marathon Event",
  eventDate = "TBD",
  eventAddress = "TBD",
  packageName = "Standard Package",
  distance = "10K",
  amount = 0,
  orderId = "ORDER-XXX",
  orderDate = "",
  orderStatus = "CONFIRMED",
  paymentStatus = "PAID",
  transactionId,
  paymentMethod,
  bibNumber,
  tshirtSize,
  bloodGroup,
  appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
}: PaymentConfirmationEmailProps): string {
  const shortOrderId = orderId.slice(0, 8).toUpperCase();
  const shortTransactionId =
    transactionId && transactionId.length > 16
      ? `${transactionId.slice(0, 16)}...`
      : transactionId;

  // Build every detail cell once, then pair them up. A cell is only created
  // when its data exists, so the row builder can collapse / drop as needed.
  const runnerCell = detailCell({
    icon: "👤",
    label: "Runner",
    value: runnerName,
  });
  const packageCell = detailCell({
    icon: "📦",
    label: "Package",
    value: packageName,
    badge: distance,
  });
  const orderCell = detailCell({
    icon: "🧾",
    label: "Order ID",
    value: shortOrderId,
    mono: true,
  });
  const transactionCell = shortTransactionId
    ? detailCell({
        icon: "🔒",
        label: "Transaction ID",
        value: shortTransactionId,
        mono: true,
        valueSize: "12px",
      })
    : undefined;
  const paymentMethodCell = paymentMethod
    ? detailCell({
        icon: "💳",
        label: "Payment Method",
        value: paymentMethod,
        capitalize: true,
      })
    : undefined;
  const dateCell = detailCell({ icon: "📅", label: "Date", value: orderDate });
  const tshirtCell = tshirtSize
    ? detailCell({
        icon: "👕",
        label: "T-Shirt Size",
        value: tshirtSize,
        capitalize: true,
      })
    : undefined;
  const bloodCell = bloodGroup
    ? detailCell({ icon: "🩸", label: "Blood Group", value: bloodGroup })
    : undefined;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Registration Confirmed - ${eventName}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; background-color: #ecfdf5; -webkit-font-smoothing: antialiased;">

  <!-- Wrapper Table -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(180deg, #ecfdf5 0%, #ffffff 50%, #f9fafb 100%);">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Main Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px;">

          <!-- ═══ Success Header ═══ -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <!-- Success Icon with Glow -->
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 12px; background-color: rgba(16, 185, 129, 0.1); border-radius: 50%;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="width: 80px; height: 80px; background-color: #059669; background-image: linear-gradient(135deg, #34d399 0%, #059669 100%); border-radius: 50%; box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);">
                          <!-- Text checkmark: renders even when images are blocked -->
                          <span style="display: inline-block; color: #ffffff; font-size: 44px; font-weight: 700; line-height: 80px;">&#10003;</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <h1 style="margin: 24px 0 8px 0; font-size: 28px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">
                You're All Set!
              </h1>
              <p style="margin: 0; font-size: 15px; color: #6b7280;">
                Payment confirmed &amp; registration complete
              </p>
            </td>
          </tr>

          <!-- ═══ Main Card ═══ -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #f3f4f6;">

                ${
                  bibNumber
                    ? `
                <!-- ─── BIB Number Section ─── -->
                <tr>
                  <td style="background-color: #059669; background-image: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 28px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <!-- Label Row -->
                          <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td style="width: 36px; height: 36px; background-color: rgba(255,255,255,0.2); border-radius: 10px; text-align: center; vertical-align: middle;">
                                <span style="color: #ffffff; font-size: 18px; font-weight: bold;">#</span>
                              </td>
                              <td style="padding-left: 12px;">
                                <p style="margin: 0; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px;">
                                  Your BIB Number
                                </p>
                              </td>
                            </tr>
                          </table>

                          <!-- BIB Number Display -->
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td align="center" style="background-color: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); border-radius: 16px; padding: 16px 24px;">
                                <span style="font-size: 48px; font-weight: 900; color: #ffffff; font-family: ${MONO_FONT}; letter-spacing: 6px;">
                                  ${bibNumber}
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                `
                    : ""
                }

                <!-- ─── Event Info Bar ─── -->
                <tr>
                  <td style="background-color: #f9fafb; border-bottom: 1px solid #f3f4f6; padding: 16px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="width: 44px; vertical-align: top; padding-right: 14px;">
                          <div style="width: 44px; height: 44px; background-color: #e0e7ff; border-radius: 12px; text-align: center; line-height: 44px;">
                            <span style="font-size: 20px;">🎫</span>
                          </div>
                        </td>
                        <td style="vertical-align: top;">
                          <h2 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #111827; line-height: 1.3;">
                            ${eventName}
                          </h2>
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="padding-right: 16px;">
                                <span style="font-size: 12px; color: #6b7280;">📅 ${eventDate}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top: 4px;">
                                <span style="font-size: 12px; color: #6b7280;">📍 ${eventAddress}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- ─── Details Section ─── -->
                <tr>
                  <td style="padding: 24px;">

                    ${detailRow(runnerCell, packageCell)}
                    ${detailRow(orderCell, transactionCell)}
                    ${detailRow(paymentMethodCell, dateCell)}
                    ${detailRow(tshirtCell, bloodCell)}

                    <!-- Status Row -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">Status</p>
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="padding-right: 8px;">
                                ${statusBadge(orderStatus, orderStatus === "CONFIRMED")}
                              </td>
                              <td>
                                ${statusBadge(paymentStatus, paymentStatus === "PAID")}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- ─── Total Section ─── -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px 24px; border-top: 1px solid #f3f4f6;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <span style="font-size: 15px; font-weight: 600; color: #111827;">Total Paid</span>
                        </td>
                        <td align="right">
                          <span style="font-size: 26px; font-weight: 700; color: #059669;">৳${amount.toLocaleString("en-US")}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>


          <!-- ═══ Next Steps ═══ -->
          <tr>
            <td style="padding-top: 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 12px; padding: 16px 20px;">
                <tr>
                  <td>
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #854d0e;">✓ Save this email for your records</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #854d0e;">✓ Arrive at the venue 30 minutes early</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #854d0e;">✓ Bring a valid ID for verification</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #854d0e;">✓ Check your dashboard for updates</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ CTA Buttons ═══ -->
          <tr>
            <td style="padding-top: 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="${appUrl}/profile" style="display: inline-block; width: 100%; max-width: 280px; padding: 16px 32px; background-color: #111827; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; text-align: center; border-radius: 12px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);">
                      Go to Dashboard →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${appUrl}/events" style="display: inline-block; width: 100%; max-width: 280px; padding: 14px 32px; background-color: #ffffff; color: #374151; text-decoration: none; font-size: 15px; font-weight: 600; text-align: center; border-radius: 12px; border: 1px solid #e5e7eb;">
                      Browse More Events
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ Footer ═══ -->
          <tr>
            <td style="padding-top: 40px; padding-bottom: 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                      Having issues? <a href="${appUrl}/contact" style="color: #6b7280; text-decoration: underline;">Contact support</a>
                    </p>
                    <p style="margin: 16px 0 0 0; font-size: 11px; color: #d1d5db;">
                      This is an automated email from Your Marathon Platform.<br>
                      Please do not reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End Main Container -->

      </td>
    </tr>
  </table>
  <!-- End Wrapper -->

</body>
</html>
  `.trim();
}
