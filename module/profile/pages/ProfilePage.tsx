"use client";

import { useState } from "react";
import { HeroText } from "@/components/ui/HeroText";
import { ProfileForm } from "../components/ProfileForm";
import { PasswordForm } from "../components/PasswordForm";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { AdminEventsPanel } from "../components/admin/AdminEventsPanel";
import { ManageHomepagePanel } from "../components/admin/ManageHomepagePanel";
import {
  AdminCouponsPanel,
  type Coupon,
  type CouponEvent,
} from "../components/admin/AdminCouponsPanel";
import { AdminGalleryPanel } from "../components/admin/AdminGalleryPanel";
import type { UserProfile, AdminEvent, AdminOrganizer } from "@/types/profile";
import type { HeroSectionData } from "@/types/homepage";
import type { GalleryImage } from "@/types/gallery";
import {
  User,
  Lock,
  CalendarPlus,
  Layout,
  ImageIcon,
  Ticket,
} from "lucide-react";

type ProfilePageProps = {
  profile: UserProfile;
  isOAuthUser: boolean;
  adminEvents?: AdminEvent[];
  organizers?: AdminOrganizer[];
  heroSections?: HeroSectionData[];
  galleryImages?: GalleryImage[];
  coupons?: Coupon[];
  couponEvents?: CouponEvent[];
};

type Tab =
  | "profile"
  | "password"
  | "events"
  | "homepage"
  | "gallery"
  | "coupons";

const ProfilePage = ({
  profile,
  isOAuthUser,
  adminEvents = [],
  organizers = [],
  heroSections = [],
  galleryImages = [],
  coupons = [],
  couponEvents = [],
}: ProfilePageProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const isAdmin = profile.role === "ADMIN";

  const tabs = [
    {
      id: "profile" as Tab,
      label: "Profile Information",
      icon: User,
      description: "Update your personal details",
    },
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

                  {(tab.id === "events" ||
                    tab.id === "homepage" ||
                    tab.id === "coupons" ||
                    tab.id === "gallery") && (
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
            {activeTab === "events" && isAdmin && (
              <AdminEventsPanel
                initialEvents={adminEvents}
                initialOrganizers={organizers}
              />
            )}
            {activeTab === "coupons" && isAdmin && (
              <AdminCouponsPanel
                initialCoupons={coupons}
                events={couponEvents}
              />
            )}
            {activeTab === "homepage" && isAdmin && (
              <ManageHomepagePanel initialHeroes={heroSections} />
            )}
            {activeTab === "gallery" && isAdmin && (
              <AdminGalleryPanel initialImages={galleryImages} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
