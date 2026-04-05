// module/profile/components/ProfileSidebar.tsx
import type { UserProfile } from "@/types/profile";
import { Mail, Calendar, Shield } from "lucide-react";
import Image from "next/image";

type ProfileSidebarProps = {
  profile: UserProfile;
};

export function ProfileSidebar({ profile }: ProfileSidebarProps) {
  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    profile.userName ||
    profile.email.split("@")[0];

  const joinDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden mx-auto">
        {profile.image ? (
          <Image
            src={profile.image}
            alt={displayName}
            fill
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-3xl font-bold text-indigo-600">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Name */}
      <h2 className="text-lg font-bold text-gray-900 mt-4">{displayName}</h2>

      {profile.userName && (
        <p className="text-sm text-gray-400">@{profile.userName}</p>
      )}

      {/* Role Badge */}
      <div className="mt-2">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${
            profile.role === "ADMIN"
              ? "bg-purple-100 text-purple-700"
              : profile.role === "ORGANIZER"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
          }`}
        >
          <Shield className="w-3 h-3" />
          {profile.role}
        </span>
      </div>

      {/* Meta Info */}
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="truncate">{profile.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Joined {joinDate}</span>
        </div>
      </div>
    </div>
  );
}
