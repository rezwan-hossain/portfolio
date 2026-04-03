// module/gallery/components/Gallery.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "@/types/gallery";

interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface GalleryProps {
  images: GalleryImage[];
}

// Deterministic pseudo-random based on seed (index)
// Same input always produces the same output — safe during prerender
const seededRandom = (seed: number) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

const getSize = (index: number) => {
  const widths = [200, 220, 240, 260, 280, 300];
  const heights = [150, 180, 200, 250, 280, 320, 350];
  return {
    width: widths[Math.floor(seededRandom(index) * widths.length)],
    height: heights[Math.floor(seededRandom(index + 100) * heights.length)],
  };
};

const Gallery = ({ images }: GalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  // Transform database images and assign deterministic sizes
  const imagesWithSize: GalleryItem[] = images.map((img, index) => ({
    id: img.id,
    src: img.src,
    alt: img.alt || `Gallery image ${index + 1}`,
    ...getSize(index),
  }));

  return (
    <div className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-24">
        <div className="space-y-20">
          {/* Masonry Grid */}
          <div className="columns-2 md:columns-4 gap-4 space-y-4">
            {imagesWithSize.map((img, idx) => (
              <div
                key={img.id}
                className="break-inside-avoid cursor-pointer rounded-md overflow-hidden shadow hover:scale-105 transition-transform duration-200"
                onClick={() => setSelectedImage(img)}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal / Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full">
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg"
            />
            <button
              className="absolute -top-10 right-0 text-white text-3xl font-bold hover:text-gray-300 transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              &times;
            </button>
            {selectedImage.alt && (
              <p className="text-white/70 text-center mt-4 text-sm">
                {selectedImage.alt}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
