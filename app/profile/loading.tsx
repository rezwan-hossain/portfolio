import { HeroText } from "@/components/ui/HeroText";
import {
  ProfileNavSkeleton,
  ProfilePanelSkeleton,
  ProfileSidebarSkeleton,
} from "@/module/profile/components/ProfileSkeletons";

// Same layout as ProfilePage, shown instantly while the session and profile
// load. Admin data streams in later behind its own per-tab skeleton.
export default function Loading() {
  return (
    <div className="min-h-screen bg-background font-body">
      <div className="mt-42">
        <HeroText title="Profile" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-72 flex-shrink-0">
            <ProfileSidebarSkeleton />
            <ProfileNavSkeleton />
          </div>
          <div className="flex-1 min-w-0">
            <ProfilePanelSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
