// lib/sms-template-server.ts
//
// Which confirmation SMS template applies to an event:
//   1. the event's own template (Event.confirmationSmsTemplate), else
//   2. the admin's default (site_settings "sms.confirmation"), else
//   3. the built-in DEFAULT_CONFIRMATION_SMS.
// Any problem loading or rendering falls back to the built-in text, so a
// settings mistake can never stop a runner's confirmation SMS.
//
// ⚠️ Not a "use server" file — called only from trusted server code.

import { prisma } from "@/lib/prisma";
import {
  DEFAULT_CONFIRMATION_SMS,
  renderSmsTemplate,
  validateSmsTemplate,
  type SmsVars,
} from "@/lib/sms-template";

export const SMS_SETTING_KEY = "sms.confirmation";

export async function getConfirmationTemplate(eventId: string | null): Promise<{
  template: string;
  source: "event" | "default" | "builtin";
}> {
  try {
    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { confirmationSmsTemplate: true },
      });
      const t = event?.confirmationSmsTemplate?.trim();
      if (t && validateSmsTemplate(t).length === 0) return { template: t, source: "event" };
    }
    const setting = await prisma.siteSetting.findUnique({ where: { key: SMS_SETTING_KEY } });
    const t = setting?.value?.trim();
    if (t && validateSmsTemplate(t).length === 0) return { template: t, source: "default" };
  } catch (err) {
    console.error("SMS template load failed, using built-in:", err);
  }
  return { template: DEFAULT_CONFIRMATION_SMS, source: "builtin" };
}

/** The confirmation SMS text for one runner. Never throws. */
export async function buildConfirmationSms(eventId: string | null, vars: SmsVars): Promise<string> {
  const { template } = await getConfirmationTemplate(eventId);
  const text = renderSmsTemplate(template, vars);
  return text || renderSmsTemplate(DEFAULT_CONFIRMATION_SMS, vars);
}
