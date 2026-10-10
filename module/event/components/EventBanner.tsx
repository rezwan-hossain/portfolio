// One image per device: phones get the (smaller) thumbnail, tablets and
// desktops the banner. A single <img> means the browser downloads only the

import { getImageProps } from "next/image";
import { EventData } from "@/types/event";

// one it shows, and it can be fetched first (it's the page's LCP element).
export const EventBanner = ({ event }: { event: EventData }) => {
  const common = { alt: event.name, quality: 75 };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...common,
    src: event.bannerImage,
    width: 1200,
    height: 540,
    sizes: "(min-width: 1280px) 1216px, 94vw",
  });
  const {
    props: { srcSet: mobileSrcSet, ...mobileProps },
  } = getImageProps({
    ...common,
    src: event.thumbImage ?? event.bannerImage,
    width: 600,
    height: 280,
    sizes: "100vw",
  });

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-100 md:mt-4 md:mb-8">
      <picture>
        <source
          media="(min-width: 768px)"
          srcSet={desktopSrcSet}
          sizes="(min-width: 1280px) 1216px, 94vw"
        />
        <img
          {...mobileProps}
          srcSet={mobileSrcSet}
          alt={event.name}
          loading="eager"
          fetchPriority="high"
          className="w-full h-[280px] sm:h-[360px] lg:h-[540px] object-cover md:object-contain lg:object-cover rounded-xl"
        />
      </picture>
      <StatusRibbon status={event.status} />
    </div>
  );
};

const StatusRibbon = ({ status }: { status: string }) => (
  <div className="absolute top-0 left-0 h-16 w-16 overflow-visible">
    <div className="absolute -rotate-45 bg-neon-lime text-white font-body font-semibold text-xs text-center py-1 w-[170px] left-[-34px] top-[32px]">
      {status === "ACTIVE" ? "Upcoming" : status}
    </div>
  </div>
);
