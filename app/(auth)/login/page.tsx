// app/(auth)/login/page.tsx
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import LoginPage from "@/module/login/pages/LoginPage";
import { redirect } from "next/navigation";

// ✅ All async work isolated here
async function LoginGate() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LoginPage />;
}

// ✅ Sync default export with Suspense boundary
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginGate />
    </Suspense>
  );
}
