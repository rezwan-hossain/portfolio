export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
}

export type AuthCache = AuthUser | null;

export interface NavItem {
  label: string;
  href: string;
}
