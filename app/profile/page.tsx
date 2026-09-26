// app/profile/page.tsx
import ProfilePage, { type AdminData } from "@/module/profile/pages/ProfilePage";
import { getUserProfile } from "@/app/actions/profile";
import { getAdminEvents, getOrganizers } from "@/app/actions/admin";
import { getAllHeroes } from "@/app/actions/homepage";
import { getAuthUser } from "@/lib/auth/require-admin";
import { redirect } from "next/navigation";
import { getGalleryImages } from "../actions/gallery";
import { getAllCoupons } from "../actions/coupon";
import { getAllTeamMembers } from "../actions/team";
import { prisma } from "@/lib/prisma";

const EMPTY_ADMIN_DATA: AdminData = {
  adminEvents: [],
  organizers: [],
  heroSections: [],
  galleryImages: [],
  coupons: [],
  couponEvents: [],
  teamMembers: [],
};

// Everything the admin tabs need, fetched in one parallel batch. The auth
// check inside each action is deduped per request (see requireAdmin).
async function loadAdminData(): Promise<AdminData> {
  const [
    eventsData,
    orgData,
    heroData,
    galleryData,
    couponData,
    teamData,
    couponEvents,
  ] = await Promise.all([
    getAdminEvents(),
    getOrganizers(),
    getAllHeroes(),
    getGalleryImages(),
    getAllCoupons(),
    getAllTeamMembers(),
    // Simple event list for the coupon dropdown
    prisma.event.findMany({
      select: { id: true, name: true },
      orderBy: { name: "desc" },
    }),
  ]);

  return {
    adminEvents: eventsData.events,
    organizers: orgData.organizers,
    heroSections: heroData.heroes,
    galleryImages: galleryData,
    coupons: couponData.coupons,
    couponEvents,
    teamMembers: teamData.members,
  } as AdminData;
}

export default async function Page() {
  const user = await getAuthUser();

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

  // Not awaited: the page renders as soon as the profile is ready, and the
  // admin tabs show a skeleton until this promise resolves (streamed in).
  const adminData = isAdmin
    ? loadAdminData().catch((err) => {
        console.error("Failed to load admin data:", err);
        return EMPTY_ADMIN_DATA;
      })
    : null;

  return (
    <ProfilePage
      profile={data.profile}
      isOAuthUser={isOAuthUser}
      adminData={adminData}
    />
  );
}
