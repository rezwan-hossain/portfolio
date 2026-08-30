"use server";

import { syncUser } from "@/lib/auth/syncUser";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  // ← EDITED: was `const { error } = ...`. We need `data.user` to sync.
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // ← NEW: safety net.
  // The callback only fires on email-confirm and OAuth. Accounts that predate
  // this code, or whose callback errored, still have no Prisma row — and
  // placeOrder looks users up by authId, so they'd hit "User not found" at
  // checkout while fully logged in. syncUser is idempotent, so on the normal
  // path this costs one indexed lookup and returns.
  if (data.user) {
    try {
      await syncUser(data.user);
    } catch (e) {
      console.error("syncUser failed on login:", e);
      return { error: "Could not load your account. Please try again." };
    }
  }

  // ⚠️ redirect() works by throwing NEXT_REDIRECT internally. Keep it OUTSIDE
  // any try/catch, or a catch-and-return will swallow the navigation and the
  // user just sits on the login page.
  redirect("/dashboard");
}
