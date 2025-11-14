import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function requireAdmin(req: NextRequest): Promise<boolean> {
  // Create Supabase server client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Extract access token from Authorization header
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) return false;

  // Validate and get user from token
  const { data } = await supabase.auth.getUser(token);
  const user = data?.user;
  if (!user) return false;

  // Call your working check-role endpoint
  const checkUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/check-role?user_uuid=${user.id}`;

  const result = await fetch(checkUrl).then((r) => r.json());

  return result?.isAdmin === true;
}
