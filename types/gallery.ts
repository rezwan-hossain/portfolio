export type GalleryImage = {
  id: string;
  src: string;
  alt: string | null;
  createdAt: Date;
  updatedAt: Date;
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
