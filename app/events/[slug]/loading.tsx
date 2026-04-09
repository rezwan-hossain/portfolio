// components/skeletons/EventDetailSkeleton.tsx

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

const EventDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative mx-auto w-full max-w-7xl text-center px-4 mt-42">
        <Skeleton className="h-16 md:h-20 max-w-md mx-auto" />
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="border-gray-200 mx-auto mt-24 w-full border-t" />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Banner */}
        <Skeleton className="hidden md:block h-[300px] lg:h-[540px] rounded-xl mt-4 mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
          {/* Left Column */}
          <div>
            {/* Mobile Banner */}
            <Skeleton className="block md:hidden h-[280px] rounded-xl" />

            {/* Description */}
            <div className="mt-10">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[85%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <aside className="space-y-8 mt-10">
            {/* Countdown */}
            <Skeleton className="h-24 rounded-xl" />

            {/* Event Info Card */}
            <div className="border border-gray-200 rounded-lg p-6">
              <Skeleton className="h-7 w-32 mb-6" />
              <div className="space-y-5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-16 mb-2" />
                      <Skeleton className="h-5 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket Selector */}
            <div className="border border-gray-200 rounded-xl p-6">
              <Skeleton className="h-6 w-28 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-14 rounded-lg" />
                <Skeleton className="h-14 rounded-lg" />
                <Skeleton className="h-14 rounded-lg" />
              </div>
              <Skeleton className="h-12 rounded-lg mt-4" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default function Loading() {
  return <EventDetailSkeleton />;
}
