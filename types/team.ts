// types/team.ts

export type TeamCategory = "ADMIN" | "ADVISOR" | "ORGANIZER";

export type TeamMember = {
  id: string;
  name: string;
  role?: string | null;
  bio?: string | null;
  image?: string | null;
  sortOrder: number;
  category: TeamCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  githubUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  // Computed for frontend compatibility
  socials?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    instagram?: string;
    facebook?: string;
  };
};

export type TeamMemberFormData = {
  name: string;
  role: string;
  bio: string;
  image: string;
  category: TeamCategory;
  sortOrder: string;
  linkedinUrl: string;
  twitterUrl: string;
  githubUrl: string;
  instagramUrl: string;
  facebookUrl: string;
};
