// module/gallery/pages/GalleryPage.tsx
import { HeroText } from "@/components/ui/HeroText";
import Gallery from "../components/Gallery";
import type { GalleryImage } from "@/types/gallery";

type GalleryPageProps = {
  images: GalleryImage[];
};

const GalleryPage = ({ images }: GalleryPageProps) => {
  return (
    <div className="min-h-screen bg-background font-body">
      <div className="mt-42">
        <HeroText title="Gallery" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {images.length > 0 ? (
          <Gallery images={images} />
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No images yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Check back soon for photos from our events!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
