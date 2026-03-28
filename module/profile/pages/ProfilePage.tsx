// module/profile/pages/ProfilePage.tsx
"use client";

import { useState } from "react";
import { HeroText } from "@/components/ui/HeroText";
import { ProfileForm } from "../components/ProfileForm";
import { PasswordForm } from "../components/PasswordForm";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { AdminEventsPanel } from "../components/admin/AdminEventsPanel";
import type { UserProfile, AdminEvent, AdminOrganizer } from "@/types/profile";
import { User, Lock, CalendarPlus } from "lucide-react";

type ProfilePageProps = {
  profile: UserProfile;
  isOAuthUser: boolean;
  adminEvents?: AdminEvent[];
  organizers?: AdminOrganizer[];
};

type Tab = "profile" | "password" | "events";

const ProfilePage = ({
  profile,
  isOAuthUser,
  adminEvents = [],
  organizers = [],
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
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background font-body">
      <div className="mt-32">
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

                  {/* Admin badge */}
                  {tab.id === "events" && (
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
