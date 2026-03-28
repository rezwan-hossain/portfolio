// app/profile/page.tsx
import ProfilePage from "@/module/profile/pages/ProfilePage";
import { getUserProfile } from "@/app/actions/profile";
import { getAdminEvents, getOrganizers } from "@/app/actions/admin";
import { getAllHeroes } from "@/app/actions/homepage";
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

  const isOAuthUser = user.app_metadata?.provider === "google";
  const isAdmin = data.profile.role === "ADMIN";

  let adminEvents: any[] = [];
  let organizers: any[] = [];
  let heroSections: any[] = [];

  if (isAdmin) {
    const [eventsData, orgData, heroData] = await Promise.all([
      getAdminEvents(),
      getOrganizers(),
      getAllHeroes(),
    ]);
    adminEvents = eventsData.events;
    organizers = orgData.organizers;
    heroSections = heroData.heroes;
  }

  return (
    <ProfilePage
      profile={data.profile}
      isOAuthUser={isOAuthUser}
      adminEvents={adminEvents}
      organizers={organizers}
      heroSections={heroSections}
    />
  );
}
