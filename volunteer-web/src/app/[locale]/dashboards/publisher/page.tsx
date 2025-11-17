'use client';

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import PublisherTabs from "./PublisherTabs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type UserRole = {
  id: string;
  name: string;
};

export default function PublisherDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        router.push(`/${locale}`);
        return;
      }

      const r = await fetch(`/api/user-active-roles?user_uuid=${user.id}`);
      const roles: UserRole[] = await r.json();

      const canPublish = roles.some((role) => role.name === "publisher");


      if (!canPublish) {
        router.push(`/${locale}`);
        return;
      }

      setAllowed(true);
      setLoading(false);
    }

    checkRole();
  }, [router, locale]);

  if (loading) return <p className="p-8">Checking access…</p>;
  if (!allowed) return null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Publisher Dashboard</h1>
      <PublisherTabs />
    </div>
  );
}
