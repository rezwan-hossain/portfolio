export type HeroSectionData = {
  id: string;
  title: string;
  desktopImage: string;
  mobileImage: string | null;
  slug: string | null;
  eventDate: string | null;
  showCountdown: boolean;
  showSlugButton: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HeroFormData = {
  title: string;
  desktopImage: string;
  mobileImage: string;
  slug: string;
  eventDate: string;
  showCountdown: boolean;
  showSlugButton: boolean;
};
