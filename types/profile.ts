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
