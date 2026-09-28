// module/profile/components/admin/OrderDeliveries.tsx
"use client";

import { useEffect, useState } from "react";
import { getOrderDeliveries, type Delivery } from "@/app/actions/deliveries";
import { ChevronDown, ChevronRight, Mail, MessageSquare } from "lucide-react";

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
export function OrderDeliveries({ orderId }: { orderId: string }) {
  const [rows, setRows] = useState<Delivery[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void getOrderDeliveries(orderId).then((r) => alive && setRows(r.deliveries));
    return () => {
      alive = false;
    };
  }, [orderId]);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
        Messages
      </p>
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
