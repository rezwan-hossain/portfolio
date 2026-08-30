// ─────────────────────────────────────────────────────────────
// lib/auth/syncUser.ts
//
// NEW FILE.
//
// ⚠️  This file must NOT have "use server" at the top.
// Every export in a "use server" file becomes a public POST endpoint.
// syncUser takes an auth user as an argument and links authId → email →
// order history. Exposed as a server action, a stranger could call it with
// { id: "guest_whatever", email: "victim@example.com" } and hand themselves
// somebody else's account. Only call this from code that got its authUser
// straight from Supabase.
// ─────────────────────────────────────────────────────────────

import type { User as SupabaseUser } from "@supabase/supabase-js";

import { Prisma } from "@/lib/generated/prisma"; // ← matches your generator output path
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

/**
 * Maps a verified Supabase auth user onto exactly ONE Prisma User row.
 * Idempotent — safe to call on every login, every callback, every request.
 *
 * Four cases:
 *   1. already linked (authId matches)      → return it
 *   2. guest row owns this email            → ADOPT in place: same User.id,
 *                                             so every order placed as a
 *                                             guest is already attached.
 *                                             Nothing to migrate.
 *   3. real row owns this email, other authId → re-point authId
 *   4. nothing exists                       → create fresh
 */
export async function syncUser(authUser: SupabaseUser) {
  const log = logger.child({ action: "syncUser", authId: authUser.id });

  try {
    // Guest rows are written lowercased at checkout, so normalise before
    // comparing or the lookup silently misses and we create a duplicate.
    const email = authUser.email?.trim().toLowerCase();

    if (!email) {
      log.error("sync:no_email_on_auth_user");
      throw new Error("NO_EMAIL");
    }

    // ── 1. already linked ──────────────────────────────────────
    const byAuthId = await prisma.user.findUnique({
      where: { authId: authUser.id },
    });

    if (byAuthId) {
      log.info({ userId: byAuthId.id }, "sync:already_linked");
      return byAuthId;
    }

    // ── metadata extraction ────────────────────────────────────
    // registerUser writes `full_name`. Google gives `full_name`/`name` plus
    // `avatar_url`/`picture`. Your old upsert also read `firstName`, so that
    // stays first in the chain.
    const meta = authUser.user_metadata ?? {};
    const displayName: string | undefined =
      meta.firstName ?? meta.full_name ?? meta.name ?? undefined;
    const firstName = displayName?.trim().split(/\s+/)[0];
    const image: string | undefined =
      meta.avatar_url ?? meta.picture ?? undefined;

    // ── does a row already own this email? ─────────────────────
    const byEmail = await prisma.user.findUnique({ where: { email } });

    if (byEmail) {
      // ── 2. ADOPT the guest row ───────────────────────────────
      // This is the whole point of the file. The row keeps its id, so
      // Order.userId never has to change and the guest's past purchases
      // appear in the dashboard the instant they log in.
      if (byEmail.isGuest) {
        const adopted = await prisma.user.update({
          where: { id: byEmail.id },
          data: {
            authId: authUser.id, // was "guest_<uuid>"
            isGuest: false,
            firstName: firstName ?? byEmail.firstName,
            image: image ?? byEmail.image,
          },
        });

        log.info({ userId: adopted.id }, "sync:guest_adopted");
        return adopted;
      }

      // ── 3. real account, different authId ────────────────────
      // Happens when identity linking is off in Supabase and the same person
      // signs up with a password and later uses Google — two auth users, one
      // email. Both proved ownership of the address, so re-point rather than
      // strand them on "User not found" at checkout.
      log.warn(
        { userId: byEmail.id, oldAuthId: byEmail.authId },
        "sync:authid_repointed",
      );

      return prisma.user.update({
        where: { id: byEmail.id },
        data: { authId: authUser.id },
      });
    }

    // ── 4. brand new ───────────────────────────────────────────
    try {
      const created = await prisma.user.create({
        data: {
          authId: authUser.id,
          email,
          firstName: firstName ?? null,
          image: image ?? null,
          isGuest: false,
          role: "USER",
          isActive: true,
          isArchived: false,
        },
      });

      log.info({ userId: created.id }, "sync:created");
      return created;
    } catch (error) {
      // A guest checkout can land between the findUnique above and this
      // create. email is @unique, so the loser gets P2002. Re-enter and the
      // second pass hits case 2 or 3.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        log.warn("sync:race_retrying");
        return syncUser(authUser);
      }
      throw error;
    }
  } finally {
    await log.flush();
  }
}
