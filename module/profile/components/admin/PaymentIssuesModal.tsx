// module/profile/components/admin/PaymentIssuesModal.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  checkIssueWithShurjoPay,
  getPaymentIssues,
  resolvePaymentIssue,
} from "@/app/actions/payment-issues";
import type {
  GatewayCheck,
  IssueAction,
  PaymentIssue,
  PaymentIssueKind,
} from "@/types/payment-issues";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, Search, X } from "lucide-react";

type Group = "refund" | "confirm" | "check";

export const KIND_META: Record<
  PaymentIssueKind,
  { label: string; group: Group; badge: string; stripe: string }
> = {
  REFUND_NO_SLOT: {
    label: "Refund · paid, no slot",
    group: "refund",
    badge: "bg-red-50 text-red-700 border-red-200",
    stripe: "bg-red-500",
  },
  DUPLICATE: {
    label: "Refund · paid twice",
    group: "refund",
    badge: "bg-red-50 text-red-700 border-red-200",
    stripe: "bg-red-500",
  },
  STUCK_PENDING: {
    label: "Pending · check payment",
    group: "confirm",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    stripe: "bg-amber-500",
  },
  AMOUNT_MISMATCH: {
    label: "Amount mismatch",
    group: "check",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    stripe: "bg-blue-500",
  },
};

const FILTERS: { value: "all" | Group; label: string }[] = [
  { value: "all", label: "All" },
  { value: "confirm", label: "Pending" },
  { value: "refund", label: "Refunds" },
  { value: "check", label: "Mismatch" },
];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  });

export function PaymentIssuesModal({
  onClose,
  events = [],
  initialEventId = "all",
}: {
  onClose: () => void;
  /** Every event, so the dropdown can isolate any of them. */
  events?: { id: string; name: string }[];
  /** Open already filtered to one event (from an event row's badge). */
  initialEventId?: string;
}) {
  const [issues, setIssues] = useState<PaymentIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | Group>("all");
  const [eventId, setEventId] = useState<string>(initialEventId);
  const [flash, setFlash] = useState("");

  // State only changes when the request returns.
  const load = useCallback(
    () =>
      getPaymentIssues().then((res) => {
        setIssues(res.issues);
        setError(res.error ?? "");
        setLoading(false);
      }),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const refresh = () => {
    setLoading(true);
    void load();
  };

  const handleResolved = (key: string, message: string) => {
    setIssues((prev) => prev.filter((i) => i.key !== key));
    setFlash(message);
    setTimeout(() => setFlash(""), 5000);
    void load(); // e.g. a confirm can turn into a refund
  };

  // Open issues per event, for the dropdown.
  const perEvent = new Map<string, number>();
  for (const i of issues) perEvent.set(i.event.id, (perEvent.get(i.event.id) ?? 0) + 1);
  // Every admin event, plus any event that only appears in the issues (e.g.
  // archived); events with open issues first.
  const eventOptions = [
    ...events,
    ...issues
      .map((i) => i.event)
      .filter((e, idx, arr) => !events.some((x) => x.id === e.id) && arr.findIndex((x) => x.id === e.id) === idx),
  ].sort((a, b) => (perEvent.get(b.id) ?? 0) - (perEvent.get(a.id) ?? 0));
  const selectedEventName =
    eventId === "all" ? null : (eventOptions.find((e) => e.id === eventId)?.name ?? "this event");

  const inEvent = eventId === "all" ? issues : issues.filter((i) => i.event.id === eventId);
  const counts = inEvent.reduce(
    (acc, i) => {
      acc[KIND_META[i.kind].group]++;
      return acc;
    },
    { refund: 0, confirm: 0, check: 0 } as Record<Group, number>,
  );
  const visible =
    filter === "all" ? inEvent : inEvent.filter((i) => KIND_META[i.kind].group === filter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900">Payments needing attention</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {loading && issues.length === 0
                ? "Loading…"
                : `${selectedEventName ? `${selectedEventName} · ` : ""}${inEvent.length} open · ${counts.confirm} pending · ${counts.refund} refund · ${counts.check} mismatch`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <button
              onClick={refresh}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-gray-100 flex-shrink-0">
          <label htmlFor="issues-event" className="sr-only">Event</label>
          <select
            id="issues-event"
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              setFilter("all");
            }}
            className="h-8 max-w-full sm:max-w-[16rem] px-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-900 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-900"
          >
            <option value="all">All events ({issues.length})</option>
            {eventOptions.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({perEvent.get(e.id) ?? 0})
              </option>
            ))}
          </select>
          {FILTERS.map((f) => {
            const n = f.value === "all" ? inEvent.length : counts[f.value];
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                aria-pressed={filter === f.value}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                  filter === f.value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label} {n > 0 && <span className="opacity-60">({n})</span>}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
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

          {loading && issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">Loading…</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-gray-900 font-bold text-lg">All clear</p>
              <p className="text-gray-400 text-sm mt-1">
                No payments need attention
                {selectedEventName && ` for ${selectedEventName}`}
                {filter !== "all" && " in this category"}.
              </p>
            </div>
          ) : (
            visible.map((issue) => (
              <IssueCard key={issue.key} issue={issue} onResolved={handleResolved} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── One issue ─────────────────────────────────────────
export function IssueCard({
  issue,
  onResolved,
}: {
  issue: PaymentIssue;
  onResolved: (key: string, message: string) => void;
}) {
  const meta = KIND_META[issue.kind];
  const [busy, setBusy] = useState<IssueAction | "CHECK" | null>(null);
  const [error, setError] = useState("");
  const [check, setCheck] = useState<GatewayCheck | null>(null);
  const [noteFor, setNoteFor] = useState<"REFUNDED" | "DISMISS" | null>(null);
  const [note, setNote] = useState("");
  const [confirmRelease, setConfirmRelease] = useState(false);

  const runCheck = async () => {
    setBusy("CHECK");
    setError("");
    setCheck(await checkIssueWithShurjoPay(issue.orderId));
    setBusy(null);
  };

  const resolve = async (action: IssueAction) => {
    setBusy(action);
    setError("");
    const res = await resolvePaymentIssue(issue.kind, issue.orderId, action, note);
    setBusy(null);
    if (!res.success) {
      setError(res.error ?? "Something went wrong");
      return;
    }
    onResolved(issue.key, res.message ?? "Done.");
  };

  const btn =
    "flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const primary = `${btn} bg-gray-900 text-white hover:bg-gray-800`;
  const secondary = `${btn} text-gray-700 border border-gray-200 hover:bg-gray-50`;
  const danger = `${btn} text-red-600 border border-red-200 hover:bg-red-50`;
  const spin = (a: IssueAction | "CHECK") =>
    busy === a ? <Loader2 size={12} className="animate-spin" /> : null;

  return (
    <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${meta.stripe}`} />
      <div className="pl-5 pr-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border rounded px-1.5 py-0.5 ${meta.badge}`}>
              <AlertTriangle size={11} />
              {meta.label}
            </span>
            <p className="text-sm font-bold text-gray-900 mt-2 truncate">{issue.runner.name}</p>
            <p className="text-xs text-gray-500 truncate">
              {issue.event.name} · {issue.packageName}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-black text-gray-900 tabular-nums">৳{issue.amount.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-gray-400 font-mono">{issue.orderId.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
          {issue.runner.phone && <span className="select-all tabular-nums">{issue.runner.phone}</span>}
          {issue.runner.email && <span className="select-all break-all">{issue.runner.email}</span>}
          <span className="text-gray-400">
            Order {issue.orderStatus.toLowerCase()} · payment {(issue.paymentStatus ?? "none").toLowerCase()}
          </span>
          {issue.spOrderId && <span className="font-mono text-gray-500 select-all">{issue.spOrderId}</span>}
          <span className="text-gray-400">Since {fmtDate(issue.flaggedAt)}</span>
        </div>

        <p className="mt-3 text-xs text-gray-600 leading-relaxed">{issue.detail}</p>

        {check && (
          <div
            className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
              check.ok && check.paid ? "bg-green-50 border-green-200 text-green-800" : "bg-gray-50 border-gray-200 text-gray-700"
            }`}
          >
            {!check.ok ? (
              check.error
            ) : (
              <>
                <span className="font-bold">ShurjoPay: {check.paid ? "PAID" : "NOT PAID"}</span>
                {check.code !== null && ` · code ${check.code}`}
                {check.message && ` (${check.message})`}
                {check.amount !== null && ` · ৳${check.amount.toLocaleString("en-IN")}`}
                {check.method && ` · ${check.method}`}
                {check.paid && check.amount !== null && check.amount < check.expected && (
                  <span className="block mt-1 text-red-700 font-medium">
                    Paid less than the order amount (৳{check.expected.toLocaleString("en-IN")}).
                  </span>
                )}
              </>
            )}
          </div>
        )}

        {noteFor && (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder={
              noteFor === "DISMISS"
                ? "Required: how was this handled?"
                : "Optional: refund reference or date"
            }
            className="mt-3 w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          />
        )}

        {error && <p className="mt-3 text-xs text-red-600 font-medium">{error}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          {noteFor ? (
            <>
              <button
                onClick={() => resolve(noteFor)}
                disabled={!!busy || (noteFor === "DISMISS" && note.trim().length < 3)}
                className={noteFor === "DISMISS" ? secondary : primary}
              >
                {spin(noteFor)}
                {noteFor === "DISMISS" ? "Confirm dismiss" : "Confirm refunded"}
              </button>
              <button onClick={() => setNoteFor(null)} className={`${btn} text-gray-500 hover:bg-gray-50`}>
                Cancel
              </button>
            </>
          ) : (
            <>
              {(issue.kind === "STUCK_PENDING" || issue.kind === "AMOUNT_MISMATCH") && (
                <button onClick={runCheck} disabled={!!busy} className={secondary}>
                  {spin("CHECK") ?? <Search size={12} />}
                  Check with ShurjoPay
                </button>
              )}
              {issue.kind === "STUCK_PENDING" && (
                <button
                  onClick={() => resolve("CONFIRM")}
                  disabled={!!busy || (check?.ok === true && !check.paid)}
                  title="Checks ShurjoPay again, then confirms and sends the email + SMS"
                  className={primary}
                >
                  {spin("CONFIRM")}
                  Confirm &amp; notify
                </button>
              )}
              {issue.kind === "AMOUNT_MISMATCH" && (
                <button
                  onClick={() => resolve("CONFIRM_ANYWAY")}
                  disabled={!!busy || (check?.ok === true && !check.paid)}
                  title="Confirms at the amount ShurjoPay reports, then sends the email + SMS"
                  className={primary}
                >
                  {spin("CONFIRM_ANYWAY")}
                  Accept &amp; confirm
                </button>
              )}
              {(issue.kind === "STUCK_PENDING" || issue.kind === "AMOUNT_MISMATCH") &&
                (confirmRelease ? (
                  <>
                    <button onClick={() => resolve("RELEASE")} disabled={!!busy} className={danger}>
                      {spin("RELEASE")}
                      Yes, release slot
                    </button>
                    <button onClick={() => setConfirmRelease(false)} className={`${btn} text-gray-500 hover:bg-gray-50`}>
                      Keep
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmRelease(true)}
                    disabled={!!busy || (check?.ok === true && check.paid)}
                    title="Only allowed if ShurjoPay says it was NOT paid"
                    className={danger}
                  >
                    Release slot
                  </button>
                ))}
              {issue.kind === "REFUND_NO_SLOT" && (
                <button onClick={() => resolve("REINSTATE")} disabled={!!busy} className={secondary}
                  title="Gives the runner a free slot, confirms the order and sends the email + SMS">
                  {spin("REINSTATE")}
                  Reinstate (use a slot)
                </button>
              )}
              {(issue.kind === "REFUND_NO_SLOT" || issue.kind === "DUPLICATE") && (
                <button onClick={() => setNoteFor("REFUNDED")} disabled={!!busy} className={primary}>
                  Mark refunded
                </button>
              )}
              <button onClick={() => setNoteFor("DISMISS")} disabled={!!busy} className={`${btn} text-gray-500 hover:bg-gray-50 ml-auto`}>
                Dismiss…
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
