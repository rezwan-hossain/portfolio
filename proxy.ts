// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  // ────────────────────────────────────────────────────────
  // 1. GENERATE REQUEST ID
  //    - reuse existing if provided (e.g. load balancer)
  //    - otherwise generate a new one
  // ────────────────────────────────────────────────────────
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  // ────────────────────────────────────────────────────────
  // 2. CREATE NEW HEADERS WITH REQUEST ID
  //    - NextRequest.headers is read-only
  //    - we must clone and inject
  // ────────────────────────────────────────────────────────
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  // ────────────────────────────────────────────────────────
  // 3. CREATE RESPONSE WITH FORWARDED HEADERS
  //    - this makes x-request-id available inside:
  //      → server components via headers()
  //      → server actions via headers()
  //      → route handlers via headers()
  // ────────────────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // ────────────────────────────────────────────────────────
  // 4. SUPABASE AUTH — COOKIE REFRESH
  //    - uses original request.cookies (not the cloned headers)
  //    - sets refreshed cookies on supabaseResponse
  //    - DO NOT modify this section
  // ────────────────────────────────────────────────────────
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // update request cookies (for downstream middleware / supabase reads)
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );

            // update response cookies (sent back to browser)
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // triggers token refresh if needed
    // IMPORTANT: do not remove this even if you don't use the result
    await supabase.auth.getUser();
  } catch (error) {
    // ──────────────────────────────────────────────────────
    // NEVER crash middleware on auth failure
    // user will just be treated as unauthenticated
    // the request still goes through
    // ──────────────────────────────────────────────────────
    console.error("[middleware] supabase auth error:", error);
  }

  // ────────────────────────────────────────────────────────
  // 5. SET RESPONSE HEADERS
  //    - x-request-id: for client-side correlation
  //    - security headers: production best practices
  // ────────────────────────────────────────────────────────
  supabaseResponse.headers.set("x-request-id", requestId);

  // security headers
  // supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  // supabaseResponse.headers.set("X-Frame-Options", "DENY");
  // supabaseResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // supabaseResponse.headers.set(
  //   "Permissions-Policy",
  //   "camera=(), microphone=(), geolocation=()"
  // );

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static   (static files)
     * - _next/image    (image optimization)
     * - favicon.ico    (favicon)
     * - common image formats
     * - sitemap.xml / robots.txt
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
