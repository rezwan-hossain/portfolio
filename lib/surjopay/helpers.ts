// lib/shurjopay/helpers.ts

import { SP_CODE } from "./types";
import type { ShurjoPayVerificationItem } from "./types";

function spCode(item: ShurjoPayVerificationItem): number {
  return Number(item.sp_code);
}

export function isPaymentSuccessful(item: ShurjoPayVerificationItem): boolean {
  return spCode(item) === SP_CODE.SUCCESS;
}

export function isPaymentDeclined(item: ShurjoPayVerificationItem): boolean {
  return spCode(item) === SP_CODE.DECLINED_BY_BANK;
}

export function isPaymentCancelled(item: ShurjoPayVerificationItem): boolean {
  return spCode(item) === SP_CODE.CANCELLED_BY_CUSTOMER;
}

export function isPaymentFailed(item: ShurjoPayVerificationItem): boolean {
  return spCode(item) !== SP_CODE.SUCCESS;
}

export function getPaymentStatusMessage(
  item: ShurjoPayVerificationItem,
): string {
  switch (spCode(item)) {
    case SP_CODE.SUCCESS:
      return "Payment successful";
    case SP_CODE.DECLINED_BY_BANK:
      return "Transaction declined by bank";
    case SP_CODE.CANCELLED_BY_CUSTOMER:
      return "Transaction cancelled by customer";
    default:
      return item.sp_message || `Unknown status (code: ${spCode(item)})`;
  }
}
