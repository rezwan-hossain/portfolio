// lib/email-template-server.ts
//
// Which confirmation-email text applies to an event:
//   1. the event's own text (Event.confirmationEmail), else
//   2. the admin's default (site_settings "email.confirmation"), else
//   3. the built-in DEFAULT_CONFIRMATION_EMAIL.
// Any problem loading falls back to the built-in text, so a settings mistake
// can never stop a runner's confirmation email.
//
// ⚠️ Not a "use server" file — called only from trusted server code.

import { prisma } from "@/lib/prisma";
import type { SmsVars } from "@/lib/sms-template";
import {
  DEFAULT_CONFIRMATION_EMAIL,
  parseEmailContent,
  renderEmailContent,
  type EmailContent,
  type RenderedEmailContent,
} from "@/lib/email-template";

export const EMAIL_SETTING_KEY = "email.confirmation";

export async function getConfirmationEmailContent(eventId: string | null): Promise<{
  content: EmailContent;
  source: "event" | "default" | "builtin";
}> {
  try {
    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { confirmationEmail: true },
      });
      const c = parseEmailContent(event?.confirmationEmail);
      if (c) return { content: c, source: "event" };
    }
    const setting = await prisma.siteSetting.findUnique({ where: { key: EMAIL_SETTING_KEY } });
    const c = parseEmailContent(setting?.value);
    if (c) return { content: c, source: "default" };
  } catch (err) {
    console.error("Email template load failed, using built-in:", err);
  }
  return { content: DEFAULT_CONFIRMATION_EMAIL, source: "builtin" };
}

/** The confirmation-email text for one runner. Never throws. */
export async function buildConfirmationEmail(eventId: string | null, vars: SmsVars): Promise<RenderedEmailContent> {
  const { content } = await getConfirmationEmailContent(eventId);
  try {
    return renderEmailContent(content, vars);
  } catch {
    return renderEmailContent(DEFAULT_CONFIRMATION_EMAIL, vars);
  }
}
