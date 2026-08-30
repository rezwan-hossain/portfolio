// ─────────────────────────────────────────────────────────────
// app/auth/callback/route.ts
//
// REPLACES your existing file.
//
// The old prisma.user.upsert keyed on authId. A guest row created at
// checkout has authId "guest_<uuid>", so the upsert never matched, fell
// through to `create`, and died on the email @unique constraint with P2002 —
// unhandled, inside a route handler, so the user got bounced to /auth/error
// and could never finish signing up. syncUser looks up by authId AND email
// and adopts the guest row in place.
// ─────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";

import { syncUser } from "@/lib/auth/syncUser"; // ← NEW
import { createClient } from "@/lib/supabase/server";

// ← REMOVED: `import { prisma } from "@/lib/prisma"` — no direct DB writes here now.
// ← REMOVED: `createServerClient` and `cookies` — only the commented-out block used them.

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // ← EDITED: was console.log("⚡️ Received auth callback with code:", code).
  // Never log the code itself — it is a live credential, exchangeable for a
  // session until it's consumed.
  console.log("⚡️ Received auth callback", { hasCode: !!code });

  // ← EDITED: early return instead of falling through to the bottom. Same
  // destination, but now you can tell "no code" from "exchange failed".
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?reason=missing_code`);
  }

  const supabase = await createClient();

  // ← REMOVED: console.log("👾 Supabase client created...", supabase).
  // Dumping the client object can print your anon key and cookie internals.
  // ← REMOVED: console.log("💥 Here bang !!!").

  // ← EDITED: was `const { error } = ...` followed by a separate
  // supabase.auth.getUser() call. exchangeCodeForSession already returns the
  // user, so that extra round-trip is gone.
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("👀 Exchange failed:", error?.message);
    return NextResponse.redirect(`${origin}/auth/error?reason=exchange_failed`);
  }

  // ← EDITED: this replaces the entire prisma.user.upsert block.
  try {
    await syncUser(data.user);
  } catch (e) {
    // ← NEW: previously any DB failure here was an unhandled throw.
    console.error("syncUser failed in callback:", e);
    return NextResponse.redirect(`${origin}/auth/error?reason=sync_failed`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
