// module/profile/pages/ProfilePage.tsx
"use client";

import { useState } from "react";
import { HeroText } from "@/components/ui/HeroText";
import { ProfileForm } from "../components/ProfileForm";
import { PasswordForm } from "../components/PasswordForm";
import { DangerZone } from "../components/DangerZone";
import { ProfileSidebar } from "../components/ProfileSidebar";
import type { UserProfile } from "@/types/profile";
import { User, Lock, Shield, AlertTriangle } from "lucide-react";

type ProfilePageProps = {
  profile: UserProfile;
  isOAuthUser: boolean;
};

type Tab = "profile" | "password" | "danger";

const ProfilePage = ({ profile, isOAuthUser }: ProfilePageProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

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
    // {
    //   id: "danger" as Tab,
    //   label: "Danger Zone",
    //   icon: AlertTriangle,
    //   description: "Delete your account",
    // },
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

            {/* Tab Navigation */}
            <nav className="mt-6 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon
                    className={`w-4 h-4 ${
                      activeTab === tab.id
                        ? "text-indigo-600"
                        : tab.id === "danger"
                          ? "text-red-500"
                          : "text-gray-400"
                    }`}
                  />
                  <div className="text-left">
                    <p
                      className={
                        tab.id === "danger" && activeTab !== tab.id
                          ? "text-red-600"
                          : ""
                      }
                    >
                      {tab.label}
                    </p>
                    <p className="text-xs text-gray-400 font-normal">
                      {tab.description}
                    </p>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0">
            {activeTab === "profile" && <ProfileForm profile={profile} />}
            {activeTab === "password" && !isOAuthUser && <PasswordForm />}
            {/* {activeTab === "danger" && <DangerZone />} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
