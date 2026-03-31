import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  console.log("⚡️ Received auth callback with code:", code);

  if (code) {
    // const cookieStore = await cookies();

    // console.log("💥 Cookie store:", cookieStore);

    // const supabase = createServerClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    //   {
    //     cookies: {
    //       getAll() {
    //         return cookieStore.getAll();
    //       },
    //       setAll(cookiesToSet) {
    //         try {
    //           cookiesToSet.forEach(({ name, value, options }) =>
    //             cookieStore.set(name, value, options),
    //           );
    //         } catch {}
    //       },
    //     },
    //   },
    // );

    console.log("💥 Here bang !!!");

    const supabase = await createClient();

    console.log("👾 Supabase client created with cookie store", supabase);

    // ✅ Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("👀 Exchange code for session error:", error);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // ✅ Create user in DB if not exists
        await prisma.user.upsert({
          where: { authId: user.id },
          update: {
            firstName:
              user.user_metadata?.firstName ??
              user.user_metadata?.full_name ??
              user.user_metadata?.name ??
              undefined,
            image: user.user_metadata?.avatar_url ?? undefined,
          },
          create: {
            authId: user.id,
            email: user.email!,
            firstName:
              user.user_metadata?.firstName ??
              user.user_metadata?.full_name ??
              null,
            image: user.user_metadata?.avatar_url ?? null,
          },
        });
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Something went wrong — send to error page
  return NextResponse.redirect(`${origin}/auth/error`);
}
