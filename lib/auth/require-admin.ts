import { createClient } from "../supabase/server";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated", user: null, dbUser: null };

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
  });

  if (!dbUser) return { error: "User not found", user: null, dbUser: null };
  if (dbUser.role !== "ADMIN")
    return { error: "Unauthorized — Admin only", user: null, dbUser: null };

  return { error: null, user, dbUser };
}
