// app/gallery/loading.tsx
import { HeroText } from "@/components/ui/HeroText";

export default function Loading() {
  // Pre-defined heights for visual variety
  const skeletonHeights = [
    200, 280, 180, 320, 250, 150, 300, 220, 350, 190, 260, 170,
  ];

  return (
    <div className="min-h-screen bg-background font-body">
      <div className="mt-42">
        <HeroText title="Gallery" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative min-h-screen flex flex-col justify-center overflow-hidden">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-24">
            <div className="space-y-20">
              {/* Masonry Grid Skeleton */}
              <div className="columns-2 md:columns-4 gap-4 space-y-4">
                {skeletonHeights.map((height, index) => (
                  <div
                    key={index}
                    className="break-inside-avoid rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 animate-pulse"
                    style={{ height: `${height}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
