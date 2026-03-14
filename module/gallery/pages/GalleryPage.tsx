import { HeroText } from "@/components/ui/HeroText";
import Gallery from "../components/Gallery";

const images = [
  {
    src: "https://cruip-tutorials.vercel.app/masonry/masonry-01.jpg",
    alt: "Image 01",
  },
  {
    src: "https://cruip-tutorials.vercel.app/masonry/masonry-02.jpg",
    alt: "Image 02",
  },
  {
    src: "https://cruip-tutorials.vercel.app/masonry/masonry-03.jpg",
    alt: "Image 03",
  },
  {
    src: "https://cruip-tutorials.vercel.app/masonry/masonry-04.jpg",
    alt: "Image 04",
  },
  {
    src: "https://cruip-tutorials.vercel.app/masonry/masonry-05.jpg",
    alt: "Image 05",
  },
  {
    src: "https://cruip-tutorials.vercel.app/masonry/masonry-06.jpg",
    alt: "Image 06",
  },
  {
    src: "https://cruip-tutorials.vercel.app/masonry/masonry-07.jpg",
    alt: "Image 07",
  },
  {
    src: "https://cruip-tutorials.vercel.app/masonry/masonry-08.jpg",
    alt: "Image 08",
  },
  {
    src: "https://cruip-tutorials.vercel.app/masonry/masonry-09.jpg",
    alt: "Image 09",
  },
  {
    src: "https://cruip-tutorials.vercel.app/masonry/masonry-10.jpg",
    alt: "Image 10",
  },
  {
    src: "https://cruip-tutorials.vercel.app/masonry/masonry-11.jpg",
    alt: "Image 11",
  },
  {
    src: "https://cruip-tutorials.vercel.app/masonry/masonry-12.jpg",
    alt: "Image 12",
  },
];

const GalleryPage = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <div className="mt-42 ">
        <HeroText title="Gallery" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Gallery images={images} />
      </div>
    </div>
  );
};

export default GalleryPage;
