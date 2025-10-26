'use client';

import { useEffect, useState } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import Image from 'next/image';
import ProfileTabs from './components/ProfileTabs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Role {
  name: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        const res = await fetch(`/api/user/${data.user.id}/roles`);
        if (res.ok) setRoles(await res.json());
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user)
    return <p className="p-6 text-center text-gray-600">Please log in to view your profile.</p>;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center border border-gray-200 mt-10">
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          {user?.user_metadata?.avatar_url ? (
            <Image
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata.full_name || 'Profile Avatar'}
              width={100}
              height={100}
              className="rounded-full object-cover border border-gray-300"
            />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center rounded-full bg-white border border-gray-300 shadow-sm">
              <span className="text-gray-700 text-3xl">👤</span>
            </div>
          )}
        </div>

        {/* Name + Email */}
        <h2 className="text-2xl font-semibold mb-1">
          {user.user_metadata?.full_name || 'Unnamed User'}
        </h2>
        <p className="text-gray-500 mb-4">{user.email}</p>

        {/* Roles Section */}
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <h3 className="font-medium text-gray-700 mb-1">Roles</h3>
          {roles.length > 0 ? (
            <ul className="text-sm text-gray-600">
              {roles.map((r) => (
                <li key={r.name}>• {r.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Volunteer</p>
          )}
        </div>
      </div>

      {/* ⬇️ Tabs Section */}
      <div className="w-full max-w-5xl mt-8">
        <ProfileTabs user={user} />
      </div>
    </div>
  );
}
