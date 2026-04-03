// app/gallery/page.tsx
import GalleryPage from "@/module/gallery/pages/GalleryPage";
import { getGalleryImages } from "../actions/gallery";

export const metadata = {
  title: "Gallery",
  description: "Photos and memories from our running events.",
};

export default async function Page() {
  const images = await getGalleryImages();

  return <GalleryPage images={images} />;
}
