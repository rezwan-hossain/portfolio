// app/actions/email-settings.ts
"use server";

// Admin editing of the payment-confirmation email text. Every export is a
// public endpoint, so every one starts with requireAdmin().

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { audit } from "@/lib/audit";
import { sendPaymentConfirmationEmail } from "@/lib/email/send-payment-confirmation";
import {
  DEFAULT_CONFIRMATION_EMAIL,
  EMAIL_FIELDS,
  cleanEmailContent,
  parseEmailContent,
  renderEmailContent,
  validateEmailContent,
  type EmailContent,
} from "@/lib/email-template";
import { sampleSmsVars } from "@/lib/sms-template";
import { EMAIL_SETTING_KEY } from "@/lib/email-template-server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Input arrives from the browser: accept only the five text fields.
function readInput(input: unknown): EmailContent | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  if (!EMAIL_FIELDS.every((f) => typeof o[f] === "string")) return null;
  return cleanEmailContent({
    subject: o.subject as string,
    heading: o.heading as string,
    subheading: o.subheading as string,
    message: o.message as string,
    checklist: o.checklist as string,
  });
}

function problemsOf(c: EmailContent): string | null {
  const errors = validateEmailContent(c);
  const list = Object.values(errors);
  return list.length ? list.join(" ") : null;
}

export async function getEmailSettings(): Promise<{
  builtin: EmailContent;
  defaultContent: EmailContent | null; // null = using the built-in text
  defaultUpdatedAt: string | null;
  events: { id: string; name: string; date: string; content: EmailContent | null }[];
  error: string | null;
}> {
  const empty = { builtin: DEFAULT_CONFIRMATION_EMAIL, defaultContent: null, defaultUpdatedAt: null, events: [] };
  const { error } = await requireAdmin();
  if (error) return { ...empty, error };

  try {
    const [setting, events] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: EMAIL_SETTING_KEY } }),
      prisma.event.findMany({
        where: { isArchived: false },
        select: { id: true, name: true, date: true, confirmationEmail: true },
        orderBy: { date: "desc" },
      }),
    ]);
    return {
      builtin: DEFAULT_CONFIRMATION_EMAIL,
      defaultContent: parseEmailContent(setting?.value),
      defaultUpdatedAt: setting?.updatedAt.toISOString() ?? null,
      events: events.map((e) => ({
        id: e.id,
        name: e.name,
        date: e.date.toISOString(),
        content: parseEmailContent(e.confirmationEmail),
      })),
      error: null,
    };
  } catch (err) {
    console.error("getEmailSettings error:", err);
    return { ...empty, error: "Failed to load email settings" };
  }
}

/** Save the default text. Pass null to go back to the built-in text. */
export async function saveDefaultEmail(
  input: EmailContent | null,
): Promise<{ success: boolean; error: string | null }> {
  const { error, dbUser } = await requireAdmin();
  if (error || !dbUser) return { success: false, error: error ?? "Unauthorized" };

  try {
    const before = await prisma.siteSetting.findUnique({ where: { key: EMAIL_SETTING_KEY } });
    const beforeContent = parseEmailContent(before?.value);

    if (input === null) {
      await prisma.siteSetting.deleteMany({ where: { key: EMAIL_SETTING_KEY } });
      await audit({
        action: "email.default_reset",
        entityType: "event",
        entityId: EMAIL_SETTING_KEY,
        summary: "Reset the default confirmation email to the built-in text",
        changes: { content: [beforeContent, null] },
      });
      return { success: true, error: null };
    }

    const content = readInput(input);
    if (!content) return { success: false, error: "Invalid email text." };
    const problems = problemsOf(content);
    if (problems) return { success: false, error: problems };

    const value = JSON.stringify(content);
    await prisma.siteSetting.upsert({
      where: { key: EMAIL_SETTING_KEY },
      create: { key: EMAIL_SETTING_KEY, value, updatedById: dbUser.id },
      update: { value, updatedById: dbUser.id },
    });
    await audit({
      action: "email.default_updated",
      entityType: "event",
      entityId: EMAIL_SETTING_KEY,
      summary: "Changed the default confirmation email",
      changes: { content: [beforeContent ?? DEFAULT_CONFIRMATION_EMAIL, content] },
    });
    return { success: true, error: null };
  } catch (err) {
    console.error("saveDefaultEmail error:", err);
    return { success: false, error: "Failed to save the email text" };
  }
}

/** Save one event's own text. Pass null to use the default again. */
export async function saveEventEmail(
  eventId: string,
  input: EmailContent | null,
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { name: true, confirmationEmail: true },
    });
    if (!event) return { success: false, error: "Event not found" };

    let content: EmailContent | null = null;
    if (input !== null) {
      content = readInput(input);
      if (!content) return { success: false, error: "Invalid email text." };
      const problems = problemsOf(content);
      if (problems) return { success: false, error: problems };
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { confirmationEmail: content ?? Prisma.DbNull },
    });
    await audit({
      action: content === null ? "email.event_reset" : "email.event_updated",
      entityType: "event",
      entityId: eventId,
      eventId,
      summary:
        content === null
          ? `"${event.name}" now uses the default confirmation email`
          : `Set a custom confirmation email for "${event.name}"`,
      changes: { content: [parseEmailContent(event.confirmationEmail), content] },
    });
    return { success: true, error: null };
  } catch (err) {
    console.error("saveEventEmail error:", err);
    return { success: false, error: "Failed to save the email text" };
  }
}

/** Send the email, with sample runner details, to one address. */
export async function sendTestEmail(
  input: EmailContent,
  to: string,
  eventId: string | null,
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  const content = readInput(input);
  if (!content) return { success: false, error: "Invalid email text." };
  const problems = problemsOf(content);
  if (problems) return { success: false, error: problems };
  const address = to.trim();
  if (!EMAIL_RE.test(address) || address.length > 200) {
    return { success: false, error: "Enter a valid email address." };
  }

  const event = eventId
    ? await prisma.event.findUnique({
        where: { id: eventId },
        select: { name: true, date: true, address: true, packages: { select: { name: true, distance: true }, take: 1 } },
      })
    : null;
  const vars = sampleSmsVars(event?.name);
  if (event?.packages[0]) {
    vars.package = event.packages[0].name;
    vars.distance = event.packages[0].distance;
  }
  const rendered = renderEmailContent(content, vars);

  const result = await sendPaymentConfirmationEmail({
    to: address,
    runnerName: vars.name!,
    eventName: vars.event!,
    eventDate: event?.date ?? new Date(),
    eventAddress: event?.address ?? "Hatirjheel, Dhaka",
    packageName: vars.package!,
    distance: vars.distance!,
    amount: 1299,
    orderId: "7040d1a6-test-0000-0000-000000000000",
    orderDate: new Date(),
    orderStatus: "CONFIRMED",
    paymentStatus: "PAID",
    transactionId: "TEST-TRANSACTION",
    paymentMethod: "bKash",
    tshirtSize: "L",
    bloodGroup: "O+",
    content: { ...rendered, subject: `[TEST] ${rendered.subject}` },
  });
  await audit({
    action: "email.test_sent",
    entityType: "event",
    entityId: eventId ?? EMAIL_SETTING_KEY,
    eventId,
    summary: `Sent a test confirmation email to ${address}${result.success ? "" : " (failed)"}`,
  });
  if (!result.success) return { success: false, error: `Sending failed: ${result.error ?? "unknown error"}` };
  return { success: true, error: null };
}
