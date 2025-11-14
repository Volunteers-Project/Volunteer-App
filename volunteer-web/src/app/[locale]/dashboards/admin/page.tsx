'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import AdminTabs from './AdminTabs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ActiveRole {
  id: number;
  name: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'en';

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const checkAccess = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      router.push(`/${locale}`);
      return;
    }

    // Fetch user roles
    const res = await fetch(`/api/user-active-roles?user_uuid=${user.id}`);
    const roles: ActiveRole[] = await res.json();

    const isAdmin = roles.some((r) => r.name === 'admin');

    if (!isAdmin) {
      router.push(`/${locale}`);
      return;
    }

    setAllowed(true);
    setLoading(false);
  }, [locale, router]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  if (loading) {
    return <div className="p-8 text-center">Checking access…</div>;
  }

  if (!allowed) return null;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <AdminTabs />
    </div>
  );
}
