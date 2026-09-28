// app/api/track/route.ts
//
// Receives page-view beacons from components/tracking/PageViewTracker.tsx and
// counts them (lib/page-views.ts). Always answers 204 quickly; never errors to
// the browser. Stores counts only — see lib/page-views.ts for privacy notes.

import { NextRequest } from "next/server";
import { recordPageView } from "@/lib/page-views";

export async function POST(request: NextRequest) {
  // Link prefetches aren't real visits.
  const purpose = request.headers.get("purpose") ?? request.headers.get("sec-purpose") ?? "";
  if (/prefetch/i.test(purpose)) return new Response(null, { status: 204 });

  let path = "";
  try {
    const body = JSON.parse(await request.text());
    if (typeof body?.path === "string") path = body.path.slice(0, 300);
  } catch {
    return new Response(null, { status: 204 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  await recordPageView({ path, ip, userAgent: request.headers.get("user-agent") ?? "" });
  return new Response(null, { status: 204 });
}
