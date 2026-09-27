// types/payment-issues.ts

export type PaymentIssueKind =
  | "REFUND_NO_SLOT" // paid, but the order is cancelled (no slot) → refund or reinstate
  | "DUPLICATE" // a second payment succeeded for an already-paid order → refund
  | "AMOUNT_MISMATCH" // paid amount/order didn't match → check, confirm or release
  | "STUCK_PENDING"; // reached ShurjoPay, pending, outside automatic handling → check

export type PaymentIssue = {
  key: string;
  kind: PaymentIssueKind;
  orderId: string;
  flaggedAt: string;
  detail: string;
  orderStatus: string;
  paymentStatus: string | null;
  amount: number;
  spOrderId: string | null;
  event: { id: string; name: string };
  packageName: string;
  runner: { name: string; email: string | null; phone: string | null };
};

export type GatewayCheck =
  | {
      ok: true;
      paid: boolean;
      code: number | null;
      message: string;
      amount: number | null;
      expected: number;
      method: string | null;
    }
  | { ok: false; error: string };

export type IssueAction =
  | "CONFIRM" // check ShurjoPay; confirm + notify if paid and the amount matches
  | "CONFIRM_ANYWAY" // amount mismatch: confirm + notify even though the amount differs
  | "REINSTATE" // paid, no slot: take a free slot, confirm + notify
  | "REFUNDED" // refunded outside the site (ShurjoPay panel)
  | "RELEASE" // not paid: cancel the order and free its slot
  | "DISMISS"; // handled some other way (note required)
