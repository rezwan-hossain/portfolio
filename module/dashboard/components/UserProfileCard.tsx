// module/dashboard/components/UserProfileCard.tsx
import type { DashboardUser } from "@/types/dashboard";
import { Mail, Phone, Shield, Calendar } from "lucide-react";
import Link from "next/link";

type UserProfileCardProps = {
  user: DashboardUser;
};

export function UserProfileCard({ user }: UserProfileCardProps) {
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const displayName =
    user.firstName || user.userName || user.email.split("@")[0];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {user.image ? (
            <img
              src={user.image}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-indigo-600">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {displayName}!
            </h1>
            {user.role === "ADMIN" && (
              <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                Admin
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>

            {user.phone && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Phone className="w-4 h-4" />
                <span>{user.phone}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Joined {joinDate}</span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span className="capitalize">{user.role.toLowerCase()}</span>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <Link
          href="/profile"
          className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-full hover:bg-gray-50 transition-colors text-gray-700"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
