// app/events/loading.tsx (or wherever your page.tsx is located)

import { HeroText } from "@/components/ui/HeroText";

const EventCardSkeleton = ({
  highlighted = false,
}: {
  highlighted?: boolean;
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8 animate-pulse">
      {/* Info Card Skeleton */}
      <div className="lg:col-span-2 border border-gray-400 rounded-2xl p-8 md:p-10 flex flex-col justify-between bg-card">
        <div>
          {/* Title Skeleton */}
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-3/4" />

          {/* Description Skeleton */}
          <div className="mt-3 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3" />
          </div>

          <div className="w-full border-b border-gray-200 mt-6 mb-6" />

          {/* Details Skeleton */}
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded flex-shrink-0" />
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32" />
              </div>
            ))}
          </div>
        </div>

        {/* Button Skeleton */}
        <div className="mt-8">
          <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-full w-44" />
        </div>
      </div>

      {/* Image Skeleton */}
      <div className="hidden md:block lg:col-span-3 rounded-2xl overflow-hidden h-64 md:h-auto bg-gray-300 dark:bg-gray-700 min-h-[300px]" />
    </div>
  );
};

export default function Loading() {
  return (
    <div className="min-h-screen bg-background px-4 md:px-8 py-4 md:py-8">
      <div className="mt-42">
        <HeroText title="Events" />
      </div>
      <div className="max-w-7xl mx-auto space-y-10 mt-12">
        {/* Show 3 skeleton cards */}
        {[...Array(3)].map((_, index) => (
          <EventCardSkeleton key={index} highlighted={index === 0} />
        ))}
      </div>
    </div>
  );
}
