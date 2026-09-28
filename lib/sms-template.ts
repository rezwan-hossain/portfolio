// lib/sms-template.ts
//
// Admin-editable SMS templates. Pure functions only (no database), so the
// admin page can use the same code for its live preview.
//
// A template is plain text with {placeholders}. Rendering rules:
//   - unknown placeholders are a validation error (typos never reach runners)
//   - a line whose placeholders ALL came out empty is dropped, so
//     "T-shirt size: {tshirt}" disappears for runners with no t-shirt
//   - blank lines the admin typed are kept

export const SMS_PLACEHOLDERS = {
  name: "Runner's name",
  event: "Event name",
  package: "Package name",
  distance: "Distance",
  tshirt: "T-shirt size",
  bib: "BIB number",
  eventDate: "Event date",
  orderId: "Order ID (short)",
  amount: "Amount paid",
} as const;

export type SmsPlaceholder = keyof typeof SMS_PLACEHOLDERS;
export type SmsVars = Partial<Record<SmsPlaceholder, string | null | undefined>>;

/** Exactly the message the site sent before templates were editable. */
export const DEFAULT_CONFIRMATION_SMS = [
  "Hi {name}!",
  "Welcome to {event}.",
  "T-shirt size:{tshirt}.",
  "Thanks from Merch Sports",
].join("\n");

export const SMS_TEMPLATE_MAX = 600;

const TOKEN = /\{([a-zA-Z]+)\}/g;
const known = (k: string): k is SmsPlaceholder => k in SMS_PLACEHOLDERS;

export function renderSmsTemplate(template: string, vars: SmsVars): string {
  return template
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => {
      const tokens = [...line.matchAll(TOKEN)].map((m) => m[1]);
      if (tokens.length === 0) return line;
      const values = tokens.map((t) => (known(t) ? (vars[t] ?? "").trim() : ""));
      if (values.every((v) => v === "")) return null; // nothing to show on this line
      return line.replace(TOKEN, (_, t: string) => (known(t) ? (vars[t] ?? "").trim() : ""));
    })
    .filter((l): l is string => l !== null)
    .join("\n")
    .trim();
}

/** Problems that must be fixed before a template can be saved. */
export function validateSmsTemplate(template: string): string[] {
  const errors: string[] = [];
  const text = template.trim();
  if (!text) errors.push("The message can't be empty.");
  if (text.length > SMS_TEMPLATE_MAX)
    errors.push(`Keep the template under ${SMS_TEMPLATE_MAX} characters.`);
  const unknown = [...new Set([...text.matchAll(TOKEN)].map((m) => m[1]).filter((t) => !known(t)))];
  if (unknown.length > 0)
    errors.push(`Unknown placeholder${unknown.length > 1 ? "s" : ""}: ${unknown.map((u) => `{${u}}`).join(", ")}`);
  return errors;
}

// GSM-7 basic set (plus the extension characters, which cost two).
const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM_EXT = "^{}\\[~]|€";

/** How many SMS parts a message costs. Bangla/emoji switch to Unicode (70/part). */
export function smsParts(message: string): {
  chars: number;
  parts: number;
  unicode: boolean;
} {
  const chars = [...message];
  const unicode = chars.some((c) => !GSM_BASIC.includes(c) && !GSM_EXT.includes(c));
  if (unicode) {
    const n = chars.length;
    return { chars: n, parts: n <= 70 ? 1 : Math.ceil(n / 67), unicode };
  }
  const units = chars.reduce((s, c) => s + (GSM_EXT.includes(c) ? 2 : 1), 0);
  return { chars: units, parts: units <= 160 ? 1 : Math.ceil(units / 153), unicode };
}

/** Example runner used for previews and test messages. */
export function sampleSmsVars(eventName?: string): SmsVars {
  return {
    name: "Rahim Uddin",
    event: eventName ?? "Dhaka City Marathon 2026",
    package: "21K Half Marathon",
    distance: "21K",
    tshirt: "L",
    bib: "H0123",
    eventDate: "15 Oct 2026",
    orderId: "7040D1A6",
    amount: "৳1,299",
  };
}
