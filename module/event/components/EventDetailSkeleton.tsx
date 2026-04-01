import { Skeleton } from "@/components/ui/skeleton";

const EventDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <div className="mt-42">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Banner Image Skeleton - Desktop */}
        <div className="hidden md:block">
          <Skeleton className="w-full h-[300px] sm:h-[360px] lg:h-[540px] rounded-xl mt-4 mb-8" />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
          {/* Left Column */}
          <div>
            {/* Banner Image Skeleton - Mobile */}
            <div className="block md:hidden">
              <Skeleton className="w-full h-[280px] sm:h-[360px] rounded-xl" />
            </div>

            {/* Description Section */}
            <section className="mt-10 lg:mt-14">
              <div className="space-y-6">
                {/* Heading skeleton */}
                <Skeleton className="h-8 w-48 mb-4" />

                {/* Paragraph skeletons */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>

                <div className="space-y-3 mt-8">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/6" />
                </div>

                {/* Subheading */}
                <Skeleton className="h-6 w-56 mt-8" />

                {/* More paragraphs */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </section>

            {/* Event Details Section */}
            <section className="mt-10 lg:mt-14">
              <Skeleton className="h-10 w-64 mb-6" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="lg:sticky lg:top-20 h-fit space-y-8 mt-10">
            {/* Countdown Timer Skeleton */}
            <div className="rounded-lg border bg-card p-6">
              <Skeleton className="h-6 w-32 mb-4 mx-auto" />
              <div className="flex justify-center gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="h-12 w-12 mb-2" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>

            {/* Event Info Card Skeleton */}
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-24" />
              </div>

              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>

              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>

            {/* Ticket Selector Skeleton */}
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <Skeleton className="h-7 w-48 mb-4" />

              {/* Ticket options */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex items-center justify-between mt-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-28" />
                  </div>
                </div>
              ))}

              {/* Purchase button */}
              <Skeleton className="h-12 w-full mt-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailSkeleton;
