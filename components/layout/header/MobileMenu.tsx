// components/header/MobileMenu.tsx
"use client";

import { useCallback } from "react";
import { Plus, ArrowRight, LayoutDashboard, User, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/hooks/useAuth";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: readonly { label: string; href: string }[];
  user: AuthUser;
  loading: boolean;
  onLogout: () => void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  navItems,
  user,
  loading,
  onLogout,
}: MobileMenuProps) {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onLogout();
    onClose();
    router.push("/");
    router.refresh();
  }, [router, onLogout, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden animate-fade-in">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-lg"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 bottom-0 w-[300px] bg-neon-lime overflow-y-auto animate-slide-in">
        <div className="flex flex-col h-full pt-24 pb-8 px-6">
          <nav className="flex-1">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center justify-between py-4 text-2xl font-black text-gray-900 uppercase hover:opacity-70 border-b border-gray-900/10"
                  >
                    {item.label}
                    <Plus size={20} />
                  </Link>
                </li>
              ))}
              {user && (
                <>
                  <li>
                    <Link
                      href="/dashboard"
                      onClick={onClose}
                      className="flex items-center justify-between py-4 text-2xl font-black text-gray-900 uppercase hover:opacity-70 border-b border-gray-900/10"
                    >
                      Dashboard
                      <LayoutDashboard size={20} />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/profile"
                      onClick={onClose}
                      className="flex items-center justify-between py-4 text-2xl font-black text-gray-900 uppercase hover:opacity-70 border-b border-gray-900/10"
                    >
                      Profile
                      <User size={20} />
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <div className="space-y-3">
            {loading ? (
              <div className="w-full h-14 bg-gray-900/20 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <div className="flex items-center gap-3 bg-gray-900/10 rounded-lg px-4 py-3">
                  <div className="w-10 h-10 rounded-md bg-gray-900 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate uppercase">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-900/60 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white font-bold uppercase tracking-wider text-sm rounded-lg px-6 py-4 hover:bg-gray-800"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/register"
                onClick={onClose}
                className="flex items-center justify-center gap-3 bg-gray-900 text-white font-bold uppercase tracking-wider text-sm rounded-lg px-6 py-4 hover:bg-gray-800"
              >
                Buy Ticket
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
