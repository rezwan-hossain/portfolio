// app/profile/page.tsx
import ProfilePage from "@/module/profile/pages/ProfilePage";
import { getUserProfile } from "@/app/actions/profile";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const data = await getUserProfile();

  if (data.error || !data.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{data.error || "Profile not found"}</p>
      </div>
    );
  }

  // Check if user signed in with Google (no password change)
  const isOAuthUser = user.app_metadata?.provider === "google";

  return <ProfilePage profile={data.profile} isOAuthUser={isOAuthUser} />;
}
