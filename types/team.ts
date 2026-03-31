export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  socials?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    instagram?: string;
  };
};
