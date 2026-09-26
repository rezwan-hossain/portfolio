import { cache } from "react";
import { createClient } from "../supabase/server";
import { prisma } from "@/lib/prisma";

// Both helpers are wrapped in React `cache()`, which memoizes per request:
// a page that calls several admin actions (e.g. /profile loads six) hits
// Supabase auth and the users table once instead of once per action. The cache
// never outlives the request, so it can't leak one user's session to another.

/** The verified Supabase user for this request, or null. */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const requireAdmin = cache(async () => {
  const user = await getAuthUser();

  if (!user) return { error: "Not authenticated", user: null, dbUser: null };

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
  });

  if (!dbUser) return { error: "User not found", user: null, dbUser: null };
  if (dbUser.role !== "ADMIN")
    return { error: "Unauthorized — Admin only", user: null, dbUser: null };

  return { error: null, user, dbUser };
});
