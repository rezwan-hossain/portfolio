// types/gallery.ts
export type GalleryImage = {
  id: string;
  src: string;
  alt: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type CreateGalleryImageInput = {
  src: string;
  alt?: string;
};

export type UpdateGalleryImageInput = {
  id: string;
  src: string;
  alt?: string;
};

export type DeleteGalleryImageInput = {
  id: string;
};
