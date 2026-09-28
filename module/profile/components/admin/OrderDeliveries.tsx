// module/profile/components/admin/OrderDeliveries.tsx
"use client";

import { useEffect, useState } from "react";
import { getOrderDeliveries, resendConfirmation, type Delivery } from "@/app/actions/deliveries";
import { ChevronDown, ChevronRight, Loader2, Mail, MessageSquare, RotateCw } from "lucide-react";

const STATUS: Record<Delivery["status"], { label: string; cls: string }> = {
  sent: { label: "Sent", cls: "bg-green-50 text-green-700 border-green-200" },
  failed: { label: "Failed", cls: "bg-red-50 text-red-700 border-red-200" },
  skipped: { label: "Not sent", cls: "bg-gray-100 text-gray-600 border-gray-200" },
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  });

/** Emails and SMS sent for one order. Loads when the order is expanded. */
export function OrderDeliveries({
  orderId,
  canResend = false,
}: {
  orderId: string;
  /** Only paid, confirmed orders can be sent a confirmation again. */
  canResend?: boolean;
}) {
  const [rows, setRows] = useState<Delivery[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<"email" | "sms" | null>(null);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let alive = true;
    void getOrderDeliveries(orderId).then((r) => alive && setRows(r.deliveries));
    return () => {
      alive = false;
    };
  }, [orderId]);

  const resend = async (channel: "email" | "sms") => {
    setBusy(true);
    setOutcome(null);
    const res = await resendConfirmation(orderId, channel);
    setBusy(false);
    setConfirming(null);
    if (res.error) {
      setOutcome({ ok: false, text: res.error });
    } else {
      const lines = (res.results ?? []).map((r) => {
        const what = r.channel === "email" ? "Email" : "SMS";
        if (r.status === "sent") return `${what} sent to ${r.to}.`;
        if (r.status === "skipped") return `${what} not sent: ${r.reason}.`;
        return `${what} failed: ${r.reason}`;
      });
      setOutcome({ ok: res.success, text: lines.join(" ") || "Nothing was sent." });
    }
    setRows((await getOrderDeliveries(orderId)).deliveries);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Messages</p>
        {canResend && (
          <div className="flex flex-wrap items-center gap-1.5">
            {confirming ? (
              <>
                <span className="text-[11px] text-gray-600">
                  Send the {confirming === "email" ? "email" : "SMS"} again to the runner&apos;s current{" "}
                  {confirming === "email" ? "email" : "phone"}?
                </span>
                <button
                  onClick={() => resend(confirming)}
                  disabled={busy}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-gray-900 rounded-md hover:bg-gray-800 cursor-pointer disabled:opacity-50"
                >
                  {busy && <Loader2 size={11} className="animate-spin" />}
                  Yes, send
                </button>
                <button onClick={() => setConfirming(null)} disabled={busy} className="px-2 py-1 text-[10px] text-gray-500 hover:text-gray-700 cursor-pointer">
                  Cancel
                </button>
              </>
            ) : (
              (["email", "sms"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setConfirming(c);
                    setOutcome(null);
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <RotateCw size={11} /> Resend {c === "email" ? "email" : "SMS"}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {outcome && (
        <p className={`mb-2 text-xs font-medium ${outcome.ok ? "text-green-700" : "text-red-600"}`}>{outcome.text}</p>
      )}
      {rows === null ? (
        <div className="h-9 bg-white rounded-lg border border-gray-100 animate-pulse" />
      ) : rows.length === 0 ? (
        <p className="text-xs text-gray-400 p-2 bg-white rounded-lg border border-gray-100">
          No confirmation email or SMS recorded for this order.
        </p>
      ) : (
        <ul className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-50">
          {rows.map((d) => {
            const Icon = d.channel === "email" ? Mail : MessageSquare;
            const expandable = !!(d.message || d.providerRef || d.reason);
            const isOpen = open === d.id;
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => expandable && setOpen(isOpen ? null : d.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs ${expandable ? "cursor-pointer hover:bg-gray-50" : "cursor-default"}`}
                  aria-expanded={expandable ? isOpen : undefined}
                >
                  <Icon size={13} className="text-gray-400 flex-shrink-0" />
                  <span className={`text-[10px] font-bold uppercase tracking-wider border rounded px-1.5 py-0.5 ${STATUS[d.status].cls}`}>
                    {d.channel === "email" ? "Email" : "SMS"} · {STATUS[d.status].label}
                  </span>
                  <span className="text-gray-700 truncate min-w-0 flex-1">
                    {d.to ?? d.reason ?? "—"}
                  </span>
                  <span className="text-gray-400 tabular-nums whitespace-nowrap">{fmt(d.createdAt)}</span>
                  {expandable &&
                    (isOpen ? (
                      <ChevronDown size={12} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={12} className="text-gray-400" />
                    ))}
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 pl-8 space-y-1.5 text-[11px]">
                    {d.reason && (
                      <p className={d.status === "failed" ? "text-red-700" : "text-gray-600"}>
                        {d.status === "failed" ? "Error: " : ""}
                        {d.reason}
                      </p>
                    )}
                    {d.message && (
                      <p className="whitespace-pre-wrap rounded-md bg-gray-50 border border-gray-100 px-2 py-1.5 text-gray-800">
                        {d.message}
                      </p>
                    )}
                    {d.providerRef && (
                      <p className="text-gray-500 break-all">
                        {d.channel === "email" ? "Resend ID: " : "Gateway reply: "}
                        <span className="font-mono select-all">{d.providerRef}</span>
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
