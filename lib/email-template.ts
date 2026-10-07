// lib/email-template.ts
//
// Admin-editable TEXT of the payment-confirmation email. The layout (order
// details, BIB, amount, buttons) stays fixed in lib/email/templates/
// payment-confirmation.tsx; admins edit only the words around it.
//
// Pure functions only (no database), so the admin page uses the same code for
// its live preview. Placeholders and line rules are the SMS ones
// (lib/sms-template.ts): {name}, {event}, … and a line whose placeholders are
// all empty is left out.

import { renderSmsTemplate, SMS_PLACEHOLDERS, type SmsVars } from "@/lib/sms-template";

export type EmailContent = {
  subject: string;
  heading: string;
  subheading: string;
  /** Optional note from the organiser (kit collection, race-day info…). "" = hidden. */
  message: string;
  /** Checklist box, one item per line. "" = hidden. */
  checklist: string;
};

export type RenderedEmailContent = {
  subject: string;
  heading: string;
  subheading: string;
  message: string;
  checklist: string[];
};

export const EMAIL_FIELDS = ["subject", "heading", "subheading", "message", "checklist"] as const;
export type EmailField = (typeof EMAIL_FIELDS)[number];

/** Exactly the text the email had before it was editable. */
export const DEFAULT_CONFIRMATION_EMAIL: EmailContent = {
  subject: "✅ Registration Confirmed - {event}",
  heading: "You're All Set!",
  subheading: "Payment confirmed & registration complete",
  message: "",
  checklist: [
    "Save this email for your records",
    "Arrive at the venue 30 minutes early",
    "Bring a valid ID for verification",
    "Check your dashboard for updates",
  ].join("\n"),
};

export const EMAIL_LIMITS: Record<EmailField, number> = {
  subject: 150,
  heading: 80,
  subheading: 200,
  message: 2000,
  checklist: 1000,
};
export const CHECKLIST_MAX_ITEMS = 8;

export const EMAIL_FIELD_LABELS: Record<EmailField, string> = {
  subject: "Subject line",
  heading: "Heading",
  subheading: "Line under the heading",
  message: "Message to runners",
  checklist: "Checklist",
};

const TOKEN = /\{([a-zA-Z]+)\}/g;
const normalise = (s: string) => s.replace(/\r\n/g, "\n").trim();

/** Tidy an admin's input (line endings, outer whitespace). */
export function cleanEmailContent(c: EmailContent): EmailContent {
  return {
    subject: normalise(c.subject).replace(/\n+/g, " "),
    heading: normalise(c.heading).replace(/\n+/g, " "),
    subheading: normalise(c.subheading).replace(/\n+/g, " "),
    message: normalise(c.message),
    checklist: normalise(c.checklist)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .join("\n"),
  };
}

/** Problems that must be fixed before saving, per field. Empty object = OK. */
export function validateEmailContent(c: EmailContent): Partial<Record<EmailField, string>> {
  const errors: Partial<Record<EmailField, string>> = {};
  const clean = cleanEmailContent(c);
  for (const f of EMAIL_FIELDS) {
    const v = clean[f];
    if (v.length > EMAIL_LIMITS[f]) {
      errors[f] = `Keep it under ${EMAIL_LIMITS[f]} characters.`;
      continue;
    }
    const unknown = [...new Set([...v.matchAll(TOKEN)].map((m) => m[1]).filter((t) => !(t in SMS_PLACEHOLDERS)))];
    if (unknown.length) {
      errors[f] = `Unknown placeholder${unknown.length > 1 ? "s" : ""}: ${unknown.map((u) => `{${u}}`).join(", ")}`;
    }
  }
  if (!errors.subject && !clean.subject) errors.subject = "The subject can't be empty.";
  if (!errors.heading && !clean.heading) errors.heading = "The heading can't be empty.";
  if (!errors.checklist && clean.checklist.split("\n").filter(Boolean).length > CHECKLIST_MAX_ITEMS) {
    errors.checklist = `At most ${CHECKLIST_MAX_ITEMS} items.`;
  }
  return errors;
}

export const isValidEmailContent = (c: EmailContent) => Object.keys(validateEmailContent(c)).length === 0;

/** Read stored content (JSON from the database). Null if it isn't usable. */
export function parseEmailContent(raw: unknown): EmailContent | null {
  let v = raw;
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      return null;
    }
  }
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (!EMAIL_FIELDS.every((f) => typeof o[f] === "string")) return null;
  const c = cleanEmailContent(o as EmailContent);
  return isValidEmailContent(c) ? c : null;
}

/** Fill in a runner's details. Plain text out — the HTML template escapes it. */
export function renderEmailContent(c: EmailContent, vars: SmsVars): RenderedEmailContent {
  const r = (s: string) => renderSmsTemplate(s, vars);
  const subject = r(c.subject).replace(/\n+/g, " ");
  const heading = r(c.heading).replace(/\n+/g, " ");
  return {
    // Never send an empty subject/heading (e.g. "{bib}" alone with no BIB yet).
    subject: subject || renderSmsTemplate(DEFAULT_CONFIRMATION_EMAIL.subject, vars),
    heading: heading || DEFAULT_CONFIRMATION_EMAIL.heading,
    subheading: r(c.subheading).replace(/\n+/g, " "),
    message: r(c.message),
    checklist: r(c.checklist)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
  };
}

export const sameEmailContent = (a: EmailContent, b: EmailContent) =>
  EMAIL_FIELDS.every((f) => normalise(a[f]) === normalise(b[f]));
