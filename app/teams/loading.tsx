import { HeroText } from "@/components/ui/HeroText";

// Stats Skeleton
const TeamStatsSkeleton = () => {
  const stats = [
    { label: "Team Members" },
    { label: "Admin" },
    { label: "Core Team" },
    { label: "Events Organized" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="text-center p-6 bg-white rounded-2xl border border-gray-200 animate-pulse"
        >
          <div className="h-12 md:h-14 bg-gray-200 dark:bg-gray-700 rounded-lg w-16 mx-auto" />
          <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-24 mx-auto mt-3" />
        </div>
      ))}
    </div>
  );
};

// Team Member Card Skeleton
const TeamMemberCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200 dark:bg-gray-700" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        {/* Role */}
        <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-1/2" />
        {/* Social Icons */}
        <div className="flex gap-2 pt-2">
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full" />
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};

// Team Grid Skeleton
const TeamGridSkeleton = ({
  title,
  subtitle,
  count = 4,
}: {
  title: string;
  subtitle: string;
  count?: number;
}) => {
  return (
    <section>
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl sm:text-3xl tracking-wide text-foreground">
          {title}
        </h2>
        <p className="font-body text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {[...Array(count)].map((_, index) => (
          <TeamMemberCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
};

export default function Loading() {
  return (
    <div className="min-h-screen bg-background font-body">
      {/* Hero */}
      <div className="mt-42">
        <HeroText title="Our Team" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-4xl sm:text-5xl lg:text-6xl tracking-tight font-extrabold text-zinc-800 font-heading leading-tight">
            The people behind
            <br />
            every finish line
          </p>
          <p className="font-body text-base sm:text-lg text-muted-foreground mt-6 leading-relaxed">
            We&apos;re a team of runners, builders, and dreamers on a mission to
            make every race an unforgettable experience. Meet the crew that
            makes it all happen.
          </p>
        </div>

        {/* Stats Skeleton */}
        <div className="mb-20">
          <TeamStatsSkeleton />
        </div>

        {/* Admin Team Skeleton */}
        <div className="mb-20">
          <TeamGridSkeleton
            title="ADMIN"
            subtitle="The visionaries steering our mission forward"
            count={4}
          />
        </div>

        {/* Advisors Skeleton */}
        <div className="mb-20">
          <TeamGridSkeleton
            title="ADVISORS"
            subtitle="Expert guidance shaping our strategic direction"
            count={4}
          />
        </div>

        {/* Organizers Skeleton */}
        <div className="mb-20">
          <TeamGridSkeleton
            title="ORGANIZERS"
            subtitle="The talented individuals who bring everything together"
            count={8}
          />
        </div>
      </div>
    </div>
  );
}
