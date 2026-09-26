"use client";

import { Suspense, use, useState } from "react";
import dynamic from "next/dynamic";
import { HeroText } from "@/components/ui/HeroText";
import { ProfileForm } from "../components/ProfileForm";
import { PasswordForm } from "../components/PasswordForm";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { ProfilePanelSkeleton } from "../components/ProfileSkeletons";
import type {
  Coupon,
  CouponEvent,
} from "../components/admin/AdminCouponsPanel";
import type { UserProfile, AdminEvent, AdminOrganizer } from "@/types/profile";
import type { HeroSectionData } from "@/types/homepage";
import type { GalleryImage } from "@/types/gallery";
import type { TeamMember } from "@/types/team";
import {
  User,
  Lock,
  CalendarPlus,
  Layout,
  ImageIcon,
  Ticket,
  Users,
  BarChart3,
} from "lucide-react";

// Admin panels are code-split: non-admins never download them, and admins
// only fetch a panel's code when they open its tab.
const panelLoading = () => <ProfilePanelSkeleton />;
const AdminEventsPanel = dynamic(
  () => import("../components/admin/AdminEventsPanel").then((m) => m.AdminEventsPanel),
  { loading: panelLoading },
);
const AdminCouponsPanel = dynamic(
  () => import("../components/admin/AdminCouponsPanel").then((m) => m.AdminCouponsPanel),
  { loading: panelLoading },
);
const ManageHomepagePanel = dynamic(
  () => import("../components/admin/ManageHomepagePanel").then((m) => m.ManageHomepagePanel),
  { loading: panelLoading },
);
const AdminGalleryPanel = dynamic(
  () => import("../components/admin/AdminGalleryPanel").then((m) => m.AdminGalleryPanel),
  { loading: panelLoading },
);
const AdminDashboardPanel = dynamic(
  () => import("../components/admin/AdminDashboardPanel").then((m) => m.AdminDashboardPanel),
  { loading: panelLoading },
);
const AdminTeamPanel = dynamic(
  () => import("../components/admin/AdminTeamPanel").then((m) => m.AdminTeamPanel),
  { loading: panelLoading },
);

export type AdminData = {
  adminEvents: AdminEvent[];
  organizers: AdminOrganizer[];
  heroSections: HeroSectionData[];
  galleryImages: GalleryImage[];
  coupons: Coupon[];
  couponEvents: CouponEvent[];
  teamMembers: TeamMember[];
};

type ProfilePageProps = {
  profile: UserProfile;
  isOAuthUser: boolean;
  // Streamed from the server; null for non-admins.
  adminData: Promise<AdminData> | null;
};

type Tab =
  | "profile"
  | "dashboard"
  | "password"
  | "events"
  | "homepage"
  | "gallery"
  | "coupons"
  | "team";

type AdminTab = Exclude<Tab, "profile" | "password">;

const isAdminTab = (tab: Tab): tab is AdminTab =>
  tab !== "profile" && tab !== "password";

// Suspends (showing the skeleton) until the streamed admin data arrives.
function AdminTabContent({
  tab,
  adminData,
}: {
  tab: AdminTab;
  adminData: Promise<AdminData>;
}) {
  const data = use(adminData);

  switch (tab) {
    case "dashboard":
      return (
        <AdminDashboardPanel
          events={data.adminEvents.map((e) => ({ id: e.id, name: e.name }))}
        />
      );
    case "events":
      return (
        <AdminEventsPanel
          initialEvents={data.adminEvents}
          initialOrganizers={data.organizers}
        />
      );
    case "coupons":
      return (
        <AdminCouponsPanel
          initialCoupons={data.coupons}
          events={data.couponEvents}
        />
      );
    case "homepage":
      return <ManageHomepagePanel initialHeroes={data.heroSections} />;
    case "gallery":
      return <AdminGalleryPanel initialImages={data.galleryImages} />;
    case "team":
      return <AdminTeamPanel initialMembers={data.teamMembers} />;
  }
}

const ProfilePage = ({ profile, isOAuthUser, adminData }: ProfilePageProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const isAdmin = profile.role === "ADMIN";

  const tabs = [
    {
      id: "profile" as Tab,
      label: "Profile Information",
      icon: User,
      description: "Update your personal details",
    },
    ...(isAdmin
      ? [
          {
            id: "dashboard" as Tab,
            label: "Dashboard",
            icon: BarChart3,
            description: "Sales, revenue & runners",
          },
        ]
      : []),
    ...(!isOAuthUser
      ? [
          {
            id: "password" as Tab,
            label: "Change Password",
            icon: Lock,
            description: "Update your password",
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            id: "events" as Tab,
            label: "Manage Events",
            icon: CalendarPlus,
            description: "Create and manage events",
          },
          {
            id: "coupons" as Tab,
            label: "Manage Coupons",
            icon: Ticket,
            description: "Create & manage discounts",
          },
          {
            id: "homepage" as Tab,
            label: "Manage Homepage",
            icon: Layout,
            description: "Hero section & content",
          },
          {
            id: "gallery" as Tab,
            label: "Manage Gallery",
            icon: ImageIcon,
            description: "Add, edit & remove photos",
          },
          {
            id: "team" as Tab,
            label: "Manage Team",
            icon: Users,
            description: "Add & edit team members",
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background font-body">
      <div className="mt-42">
        <HeroText title="Profile" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <ProfileSidebar profile={profile} />

            <nav className="mt-6 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon
                    className={`w-4 h-4 ${
                      activeTab === tab.id ? "text-white" : "text-gray-400"
                    }`}
                  />
                  <div className="text-left">
                    <p>{tab.label}</p>
                    <p
                      className={`text-xs font-normal ${
                        activeTab === tab.id ? "text-white/60" : "text-gray-400"
                      }`}
                    >
                      {tab.description}
                    </p>
                  </div>

                  {(tab.id === "dashboard" ||
                    tab.id === "events" ||
                    tab.id === "homepage" ||
                    tab.id === "coupons" ||
                    tab.id === "gallery" ||
                    tab.id === "team") && (
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-neon-lime text-gray-900 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0">
            {activeTab === "profile" && <ProfileForm profile={profile} />}
            {activeTab === "password" && !isOAuthUser && <PasswordForm />}
            {isAdmin && adminData && isAdminTab(activeTab) && (
              <Suspense fallback={<ProfilePanelSkeleton />}>
                <AdminTabContent tab={activeTab} adminData={adminData} />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
