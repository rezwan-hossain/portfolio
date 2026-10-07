// module/profile/components/admin/AdminEmailPanel.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getEmailSettings, saveDefaultEmail, saveEventEmail, sendTestEmail } from "@/app/actions/email-settings";
import {
  CHECKLIST_MAX_ITEMS,
  EMAIL_FIELD_LABELS,
  EMAIL_LIMITS,
  isValidEmailContent,
  renderEmailContent,
  sameEmailContent,
  validateEmailContent,
  type EmailContent,
  type EmailField,
} from "@/lib/email-template";
import { SMS_PLACEHOLDERS, sampleSmsVars, type SmsPlaceholder } from "@/lib/sms-template";
import { getPaymentConfirmationEmailHTML } from "@/lib/email/templates/payment-confirmation";
import { CheckCircle2, Loader2, Mail, Maximize2, Monitor, RotateCcw, Save, Send, Smartphone, X } from "lucide-react";

type Settings = Awaited<ReturnType<typeof getEmailSettings>>;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  });

const HINTS: Partial<Record<EmailField, string>> = {
  message: "Optional. Kit collection, race-day timing, contact number… Links become clickable. Leave empty to hide.",
  checklist: `One item per line, up to ${CHECKLIST_MAX_ITEMS}. Leave empty to hide the box.`,
};

// ─── Preview: the real email, full height (no inner scrolling) ───
const DEVICES = {
  desktop: { label: "Desktop", icon: Monitor, width: "100%" },
  phone: { label: "Phone", icon: Smartphone, width: "390px" },
} as const;
type Device = keyof typeof DEVICES;

function EmailFrame({ html, device, className = "" }: { html: string; device: Device; className?: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  // Grow the frame to the email's own height. The frame runs no scripts
  // (sandbox without allow-scripts); allow-same-origin only lets us measure it.
  const fit = useCallback(() => {
    const frame = ref.current;
    const doc = frame?.contentDocument;
    if (frame && doc?.documentElement) frame.style.height = `${doc.documentElement.scrollHeight}px`;
  }, []);
  useEffect(() => {
    const id = requestAnimationFrame(fit); // width changed → height changes
    return () => cancelAnimationFrame(id);
  }, [device, fit]);

  return (
    <iframe
      ref={ref}
      title="Email preview"
      srcDoc={html}
      sandbox="allow-same-origin"
      onLoad={fit}
      style={{ width: DEVICES[device].width }}
      className={`block mx-auto bg-white transition-[width] ${className}`}
    />
  );
}

function EmailPreview({ html, subject }: { html: string; subject: string }) {
  const [device, setDevice] = useState<Device>("desktop");
  const [full, setFull] = useState(false);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [full]);

  const toolbar = (inModal: boolean) => (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Subject</p>
        <p className="text-sm font-semibold text-gray-900 truncate">{subject}</p>
      </div>
      <div className="flex rounded-lg border border-gray-200 p-0.5" role="group" aria-label="Preview width">
        {(Object.keys(DEVICES) as Device[]).map((d) => {
          const D = DEVICES[d];
          return (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              aria-pressed={device === d}
              className={`flex items-center gap-1.5 px-2.5 h-8 rounded-md text-xs font-semibold cursor-pointer ${
                device === d ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <D.icon size={14} aria-hidden /> {D.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setFull(!inModal)}
        className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
        aria-label={inModal ? "Close full-screen preview" : "Open full-screen preview"}
      >
        {inModal ? <X size={14} aria-hidden /> : <Maximize2 size={14} aria-hidden />}
        {inModal ? "Close" : "Full screen"}
      </button>
    </div>
  );

  return (
    <>
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        {toolbar(false)}
        <div className="bg-gray-100 p-3 sm:p-6">
          <EmailFrame html={html} device={device} className="rounded-lg shadow-sm" />
        </div>
      </div>

      {full && (
        <div
          className="fixed inset-0 z-50 bg-black/60 p-2 sm:p-6 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Email preview"
          onClick={(e) => e.target === e.currentTarget && setFull(false)}
        >
          <div className="m-auto w-full max-w-4xl h-full flex flex-col rounded-xl overflow-hidden bg-gray-100 shadow-2xl">
            {toolbar(true)}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              <EmailFrame html={html} device={device} className="rounded-lg shadow-sm" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Editor: fields + live preview of the real email ───
function ContentEditor({
  id,
  value,
  onChange,
  eventName,
}: {
  id: string;
  value: EmailContent;
  onChange: (v: EmailContent) => void;
  eventName?: string;
}) {
  const refs = useRef<Partial<Record<EmailField, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const [focused, setFocused] = useState<EmailField>("message");
  const errors = validateEmailContent(value);

  // Only rebuild the preview HTML when the visible text actually changes.
  const renderedKey = JSON.stringify(renderEmailContent(value, sampleSmsVars(eventName)));
  const rendered = useMemo(() => JSON.parse(renderedKey) as ReturnType<typeof renderEmailContent>, [renderedKey]);
  const html = useMemo(() => {
    const vars = sampleSmsVars(eventName);
    return getPaymentConfirmationEmailHTML({
      runnerName: vars.name!,
      eventName: vars.event!,
      eventDate: vars.eventDate!,
      eventAddress: "Hatirjheel, Dhaka",
      packageName: vars.package!,
      distance: vars.distance!,
      amount: 1299,
      orderId: "7040d1a6-0000",
      orderDate: "4 Oct 2026, 10:30",
      orderStatus: "CONFIRMED",
      paymentStatus: "PAID",
      transactionId: "SP6512A0C3F1",
      paymentMethod: "bKash",
      tshirtSize: vars.tshirt!,
      bloodGroup: "O+",
      content: rendered,
    });
  }, [rendered, eventName]);

  const set = (f: EmailField, v: string) => onChange({ ...value, [f]: v });

  const insert = (key: SmsPlaceholder) => {
    const el = refs.current[focused];
    const token = `{${key}}`;
    const current = value[focused];
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    set(focused, current.slice(0, start) + token + current.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const field = (f: EmailField, multiline: boolean, rows = 4) => {
    const common = {
      id: `${id}-${f}`,
      value: value[f],
      onFocus: () => setFocused(f),
      "aria-invalid": !!errors[f],
      className: `w-full border bg-white rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 ${
        errors[f] ? "border-red-300" : "border-gray-200"
      }`,
    };
    return (
      <div>
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <label htmlFor={`${id}-${f}`} className="text-xs font-semibold text-gray-700">
            {EMAIL_FIELD_LABELS[f]}
          </label>
          <span className={`text-[10px] tabular-nums ${value[f].length > EMAIL_LIMITS[f] ? "text-red-600" : "text-gray-400"}`}>
            {value[f].length}/{EMAIL_LIMITS[f]}
          </span>
        </div>
        {multiline ? (
          <textarea
            {...common}
            ref={(el) => {
              refs.current[f] = el;
            }}
            rows={rows}
            onChange={(e) => set(f, e.target.value)}
            className={`${common.className} resize-y`}
          />
        ) : (
          <input
            {...common}
            ref={(el) => {
              refs.current[f] = el;
            }}
            onChange={(e) => set(f, e.target.value)}
          />
        )}
        {errors[f] ? (
          <p className="mt-1 text-xs text-red-600 font-medium">{errors[f]}</p>
        ) : (
          HINTS[f] && <p className="mt-1 text-[11px] text-gray-500">{HINTS[f]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Insert into “{EMAIL_FIELD_LABELS[focused]}”
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(SMS_PLACEHOLDERS) as SmsPlaceholder[]).map((k) => (
              <button
                key={k}
                type="button"
                // Keep focus (and the cursor position) in the field being edited.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insert(k)}
                title={SMS_PLACEHOLDERS[k]}
                className="px-2 py-1 rounded-md border border-gray-200 bg-gray-50 text-[11px] font-mono text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                {`{${k}}`}
              </button>
            ))}
          </div>
        </div>
        {field("subject", false)}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {field("heading", false)}
          {field("subheading", false)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {field("message", true, 6)}
          {field("checklist", true, 6)}
        </div>
        <p className="text-[11px] text-gray-500">
          Order details, BIB, amount and buttons are filled in automatically. A line is left out when all its placeholders
          are empty (e.g. no BIB yet).
        </p>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
          Live preview · sample runner
        </p>
        <EmailPreview html={html} subject={rendered.subject} />
      </div>
    </div>
  );
}

// ─── Test send ───
function TestSend({ content, eventId }: { content: EmailContent; eventId: string | null }) {
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const send = async () => {
    setBusy(true);
    setResult(null);
    const res = await sendTestEmail(content, to, eventId);
    setBusy(false);
    setResult(res.success ? { ok: true, text: `Sent to ${to.trim()}. Check the inbox (and spam).` } : { ok: false, text: res.error ?? "Failed" });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
      <label htmlFor={`email-test-${eventId ?? "default"}`} className="text-xs text-gray-500">
        Send a test to
      </label>
      <input
        id={`email-test-${eventId ?? "default"}`}
        type="email"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="you@example.com"
        className="h-9 w-56 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
      />
      <button
        onClick={send}
        disabled={busy || !to.trim() || !isValidEmailContent(content)}
        className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-700 border border-gray-200 hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
        Send test
      </button>
      {result && <span className={`text-xs font-medium ${result.ok ? "text-green-700" : "text-red-600"}`}>{result.text}</span>}
    </div>
  );
}

// ─── Panel ───
export function AdminEmailPanel() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [defaultContent, setDefaultContent] = useState<EmailContent | null>(null);
  const [eventId, setEventId] = useState("");
  const [eventContent, setEventContent] = useState<EmailContent | null>(null);
  const [eventCustom, setEventCustom] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [flash, setFlash] = useState("");
  const [error, setError] = useState("");

  const applySettings = useCallback((s: Settings, keepEventId?: string) => {
    setSettings(s);
    setError(s.error ?? "");
    const current = s.defaultContent ?? s.builtin;
    setDefaultContent(current);
    const ev = s.events.find((e) => e.id === keepEventId) ?? s.events[0];
    setEventId(ev?.id ?? "");
    setEventCustom(!!ev?.content);
    setEventContent(ev?.content ?? current);
  }, []);

  useEffect(() => {
    void getEmailSettings().then((s) => applySettings(s));
  }, [applySettings]);

  const reload = async (keepEventId?: string) => applySettings(await getEmailSettings(), keepEventId);

  const done = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(""), 4000);
  };

  if (!settings || !defaultContent || !eventContent) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-100 rounded" />
        <div className="h-96 bg-white border border-gray-200 rounded-xl" />
      </div>
    );
  }

  const currentDefault = settings.defaultContent ?? settings.builtin;
  const defaultDirty = !sameEmailContent(defaultContent, currentDefault);
  const defaultValid = isValidEmailContent(defaultContent);

  const selected = settings.events.find((e) => e.id === eventId);
  const eventSaved = selected?.content ?? null;
  const eventDirty = eventCustom ? !eventSaved || !sameEmailContent(eventContent, eventSaved) : eventSaved !== null;
  const eventValid = !eventCustom || isValidEmailContent(eventContent);

  const saveDefault = async (value: EmailContent | null) => {
    setSaving(value === null ? "default-reset" : "default");
    setError("");
    const res = await saveDefaultEmail(value);
    setSaving(null);
    if (!res.success) return setError(res.error ?? "Failed to save");
    await reload(eventId);
    done(value === null ? "Default email reset to the built-in text." : "Default email saved.");
  };

  const saveEvent = async () => {
    setSaving("event");
    setError("");
    const res = await saveEventEmail(eventId, eventCustom ? eventContent : null);
    setSaving(null);
    if (!res.success) return setError(res.error ?? "Failed to save");
    await reload(eventId);
    done(eventCustom ? `Custom email saved for ${selected?.name}.` : `${selected?.name} now uses the default email.`);
  };

  const btn =
    "flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="w-5 h-5 text-gray-400" /> Confirmation Email
        </h2>
        <p className="text-sm text-gray-500 mt-1">The email a runner gets when their payment is confirmed.</p>
      </div>

      {flash && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-green-700 text-sm font-medium">{flash}</p>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Default */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <header>
          <h3 className="text-sm font-bold text-gray-900">Default confirmation email</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Used for every event that doesn&apos;t have its own text.{" "}
            {settings.defaultContent ? `Last changed ${fmtDate(settings.defaultUpdatedAt!)}.` : "Currently the built-in text."}
          </p>
        </header>

        <ContentEditor id="email-default" value={defaultContent} onChange={setDefaultContent} />

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => saveDefault(defaultContent)}
            disabled={!defaultDirty || !defaultValid || !!saving}
            className={`${btn} text-white bg-gray-900 hover:bg-gray-800`}
          >
            {saving === "default" ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Save default
          </button>
          {defaultDirty && (
            <button onClick={() => setDefaultContent(currentDefault)} className={`${btn} text-gray-600 hover:bg-gray-50`}>
              Undo changes
            </button>
          )}
          {settings.defaultContent && (
            <button
              onClick={() => saveDefault(null)}
              disabled={!!saving}
              className={`${btn} text-gray-600 border border-gray-200 hover:bg-gray-50 ml-auto`}
              title="Go back to the original text"
            >
              {saving === "default-reset" ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
              Use built-in text
            </button>
          )}
        </div>

        <TestSend content={defaultContent} eventId={null} />
      </section>

      {/* Per event */}
      {settings.events.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <header>
            <h3 className="text-sm font-bold text-gray-900">Email for one event</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Give an event its own text, e.g. kit-collection details, or a checklist for a virtual run.
            </p>
          </header>

          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="email-event" className="sr-only">Event</label>
            <select
              id="email-event"
              value={eventId}
              onChange={(e) => {
                const ev = settings.events.find((x) => x.id === e.target.value);
                setEventId(e.target.value);
                setEventCustom(!!ev?.content);
                setEventContent(ev?.content ?? currentDefault);
              }}
              className="h-9 max-w-full sm:max-w-xs px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              {settings.events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                  {e.content ? " · custom" : ""}
                </option>
              ))}
            </select>

            <div className="flex rounded-lg border border-gray-200 p-0.5" role="group" aria-label="Which email">
              {[
                { custom: false, label: "Use default" },
                { custom: true, label: "Custom email" },
              ].map((o) => (
                <button
                  key={o.label}
                  onClick={() => {
                    setEventCustom(o.custom);
                    if (o.custom && !eventSaved) setEventContent(currentDefault);
                  }}
                  aria-pressed={eventCustom === o.custom}
                  className={`px-3 h-8 rounded-md text-xs font-semibold cursor-pointer ${
                    eventCustom === o.custom ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {eventCustom ? (
            <ContentEditor id="email-event" value={eventContent} onChange={setEventContent} eventName={selected?.name} />
          ) : (
            <p className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-xs text-gray-600">
              Runners of this event get the default email above.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={saveEvent}
              disabled={!eventDirty || !eventValid || !!saving}
              className={`${btn} text-white bg-gray-900 hover:bg-gray-800`}
            >
              {saving === "event" ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {eventCustom ? "Save for this event" : "Switch to default"}
            </button>
          </div>

          {eventCustom && <TestSend content={eventContent} eventId={eventId} />}
        </section>
      )}
    </div>
  );
}
