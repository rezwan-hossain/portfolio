// module/profile/components/admin/PaymentIssuesBanner.tsx
"use client";

import type { PaymentIssue } from "@/types/payment-issues";
import { AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { KIND_META } from "./PaymentIssuesModal";

// Summary of every open payment issue across all events. The list itself is
// loaded once by AdminEventsPanel and shared with the event rows' badges.
export function PaymentIssuesBanner({
  issues,
  onOpen,
}: {
  issues: PaymentIssue[] | null;
  onOpen: () => void;
}) {
  if (issues === null) {
    return <div className="h-12 mb-6 bg-gray-50 rounded-xl animate-pulse" />;
  }

  if (issues.length === 0) {
    return (
      <button
        onClick={onOpen}
        className="w-full mb-6 flex items-center gap-2 px-4 py-3 rounded-xl border border-green-100 bg-green-50/60 text-left cursor-pointer hover:bg-green-50 transition-colors"
      >
        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
        <span className="text-sm text-green-800 font-medium">No payments need attention</span>
      </button>
    );
  }

  const refunds = issues.filter((i) => KIND_META[i.kind].group === "refund").length;
  const pending = issues.filter((i) => KIND_META[i.kind].group === "confirm").length;
  const mismatch = issues.length - refunds - pending;
  const eventCount = new Set(issues.map((i) => i.event.id)).size;

  return (
    <button
      onClick={onOpen}
      className="w-full mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-left cursor-pointer hover:bg-red-100/70 transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
        <AlertTriangle className="w-4 h-4 text-red-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-red-900">
          {issues.length} payment{issues.length === 1 ? " needs" : "s need"} attention
          {eventCount > 1 && (
            <span className="font-normal text-red-700/80"> · across {eventCount} events</span>
          )}
        </p>
        <p className="text-xs text-red-700/80">
          {[
            pending > 0 && `${pending} pending to check`,
            refunds > 0 && `${refunds} to refund`,
            mismatch > 0 && `${mismatch} amount mismatch`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-red-700">
        Review <ChevronRight size={14} />
      </span>
    </button>
  );
}
