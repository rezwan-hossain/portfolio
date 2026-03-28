// types/profile.ts
export type UserProfile = {
  id: string;
  authId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userName: string | null;
  phone: string | null;
  address: string | null;
  birthDate: string | null;
  gender: string | null;
  image: string | null;
  role: string;
  createdAt: string;
};

export type ProfileFormData = {
  firstName: string;
  lastName: string;
  userName: string;
  phone: string;
  address: string;
  birthDate: string;
  gender: string;
};

export type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type AdminEvent = {
  id: string;
  name: string;
  slug: string;
  date: string;
  time: string;
  address: string;
  eventType: string;
  description: string;
  bannerImage: string;
  thumbImage: string | null;
  minPackagePrice: number | null;
  status: string;
  isActive: boolean;
  organizerId: number;
  organizer: {
    id: number;
    name: string;
  };
  packages: AdminPackage[];
  _count: {
    orders: number;
  };
};

export type AdminPackage = {
  id: number;
  name: string;
  distance: string;
  price: number;
  availableSlots: number;
  usedSlots: number;
  status: string;
  isActive: boolean;
};

export type AdminOrganizer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  logo: string | null;
};

export type EventFormData = {
  name: string;
  slug: string;
  date: string;
  time: string;
  address: string;
  eventType: string;
  description: string;
  bannerImage: string;
  thumbImage: string;
  minPackagePrice: string;
  organizerId: string;
  status: string;
};

export type PackageFormData = {
  name: string;
  distance: string;
  price: string;
  availableSlots: string;
};
