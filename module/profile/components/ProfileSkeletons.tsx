// module/profile/components/ProfileSkeletons.tsx

// Mirrors ProfileSidebar: avatar, name, email, meta rows.
export function ProfileSidebarSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center animate-pulse">
      <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto" />
      <div className="h-5 bg-gray-200 rounded w-32 mx-auto mt-4" />
      <div className="h-3 bg-gray-100 rounded w-40 mx-auto mt-3" />
      <div className="mt-6 space-y-3">
        <div className="h-3 bg-gray-100 rounded w-3/4 mx-auto" />
        <div className="h-3 bg-gray-100 rounded w-2/3 mx-auto" />
      </div>
    </div>
  );
}

// Mirrors the tab buttons under the sidebar.
export function ProfileNavSkeleton({ items = 2 }: { items?: number }) {
  return (
    <div className="mt-6 space-y-1 animate-pulse">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-100 rounded w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Generic right-hand panel: heading plus a stack of form fields / rows.
// Used for the profile form while the route loads, and for each admin tab
// while its data streams in.
export function ProfilePanelSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-64 mb-8" />
      <div className="space-y-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i}>
            <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-11 bg-gray-100 rounded-lg w-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-8">
        <div className="h-10 bg-gray-200 rounded-lg w-32" />
      </div>
    </div>
  );
}
