// lib/payment-config.ts
//
// 1. paymentConfigProblem(): catches the setup that silently loses payment
//    confirmations — LIVE ShurjoPay sending customers back to an address they
//    can't reach (localhost / a private host). Money is taken, the redirect
//    never lands, the order stays pending. Only that case BLOCKS payments;
//    anything else is a warning so a setup detail can't stop live payments.
//
// 2. publicOrigin(): where to send the customer after the callback. Behind a
//    proxy, request.url can be http://localhost:3000, so production uses the
//    configured public site URL instead.

const PRIVATE_HOST =
  /^(localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|\[::1\]|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|.+\.local)$/i;

const tryUrl = (v: string | undefined) => {
  try {
    return v ? new URL(v) : null;
  } catch {
    return null;
  }
};

export type ConfigCheck = { block: string | null; warnings: string[] };

export function checkPaymentConfig(
  env: Record<string, string | undefined> = process.env,
): ConfigCheck {
  const api = tryUrl(env.SHURJOPAY_API_URL);
  const callback = tryUrl(env.SHURJOPAY_CALLBACK_URL);
  const warnings: string[] = [];

  if (!api || !callback) {
    return {
      block: "SHURJOPAY_API_URL and SHURJOPAY_CALLBACK_URL must both be valid URLs.",
      warnings,
    };
  }

  const isLive = !/sandbox/i.test(api.host);
  if (isLive && PRIVATE_HOST.test(callback.hostname)) {
    return {
      block: `Live ShurjoPay (${api.host}) would send customers back to ${callback.host}, which they can't reach — payments would be taken but never confirmed. Use the ShurjoPay sandbox for local development, or set SHURJOPAY_CALLBACK_URL to your public https domain.`,
      warnings,
    };
  }
  if (isLive && callback.protocol !== "https:") {
    warnings.push(`SHURJOPAY_CALLBACK_URL uses ${callback.protocol}// — live payments should use https.`);
  }
  return { block: null, warnings };
}

/** Origin to redirect the customer to after the callback. */
export function publicOrigin(requestUrl: string): string {
  const fromRequest = new URL(requestUrl).origin;
  if (process.env.NODE_ENV !== "production") return fromRequest;

  const site = tryUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (site && !PRIVATE_HOST.test(site.hostname)) return site.origin;
  return fromRequest;
}
