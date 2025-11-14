'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createClient, User } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UserMetadata {
  avatar_url?: string;
  full_name?: string;
}

interface ActiveRole {
  id: number;
  name: string;
}

export default function ProfileMenu() {
  const [user, setUser] = useState<(User & { user_metadata: UserMetadata }) | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeRoles, setActiveRoles] = useState<ActiveRole[]>([]);
  const pathname = usePathname();

  // Extract locale (default = en)
  const locale = pathname?.split('/')[1] || 'en';

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      setUser(u as User & { user_metadata: UserMetadata });

      // Load active roles
      if (u?.id) {
        const res = await fetch(`/api/user-active-roles?user_uuid=${u.id}`);
        if (res.ok) {
          const list: ActiveRole[] = await res.json();
          setActiveRoles(list);
        }
      }
    }
    load();
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <div className="relative">
      {/* Profile Icon */}
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-300 overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
      >
        {user?.user_metadata?.avatar_url ? (
          <Image
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata.full_name || 'Profile'}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        ) : (
          <span className="text-gray-700 text-sm font-semibold">👤</span>
        )}
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {!user ? (
            <>
              <Link
                href={`/${locale}/auth?tab=register`}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>

              <Link
                href={`/${locale}/auth?tab=login`}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            </>
          ) : (
            <>
              {/* Profile Page */}
              <Link
                href={`/${locale}/profile`}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>

              {/* ROLE DASHBOARD SECTION */}
              {activeRoles.length > 0 && (
                <>
                  <div className="border-t my-1"></div>

                  {activeRoles.map((role) => (
                    <Link
                      key={role.id}
                      href={`/${locale}/dashboards/${role.name}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 capitalize"
                      onClick={() => setMenuOpen(false)}
                    >
                      {role.name} Dashboard
                    </Link>
                  ))}
                </>
              )}

              {/* Logout */}
              <div className="border-t my-1"></div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setMenuOpen(false);
                  window.location.reload();
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
