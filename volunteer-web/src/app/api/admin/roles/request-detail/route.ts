import { NextRequest, NextResponse } from "next/server";


import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";


export async function GET(req: NextRequest) {

  // 🔥 Get user UUID from cookie
  const cookieStore = await cookies();
  const user_uuid = cookieStore.get("user_id")?.value;

  if (!user_uuid) {
    return NextResponse.json({ error: "Forbidden: Not logged in" }, { status: 403 });
  }

  // 🔥 Check admin using your working endpoint logic (no need to fetch!)
  const admin = await prisma.userRole.findFirst({
    where: {
      user_uuid,
      role_id: 1, // admin
      status: 2,
      active_until: { gt: new Date() },
    },
  });

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // --- Continue with request logic ---
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const data = await prisma.userRole.findUnique({
    where: { id },
    include: {
      role: true,
      user: {
        include: {
          volunteerProfile: true,
        },
      },
    },
  });

  return NextResponse.json({
    id: data?.id,
    user_uuid: data?.user_uuid,
    role_name: data?.role.name,
    status: data?.status,
    request_message: data?.request_message,
    attachment_path: data?.attachment_path,
    created_at: data?.created_at,

    active_until: data?.active_until,
    downtime_until: data?.downtime_until,
    rejection_reason: data?.rejection_reason,

    user: {
      email: data?.user.email,
      username: data?.user.username,
      volunteerProfile: data?.user.volunteerProfile
        ? {
            name: data.user.volunteerProfile.name,
            phone: data.user.volunteerProfile.phone,
            lineId: data.user.volunteerProfile.lineId,
            whatsapp: data.user.volunteerProfile.whatsapp,
            profilePrivate: data.user.volunteerProfile.profilePrivate,
          }
        : undefined,
    },
  });
}
