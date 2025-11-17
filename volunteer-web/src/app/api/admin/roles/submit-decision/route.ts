import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";


export async function POST(req: NextRequest) {
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

  const {
    id,
    decision,
    active_until,
    downtime_until,
    rejection_reason
  } = await req.json();

  const entry = await prisma.userRole.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!entry) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let updated;

  if (decision === 'approve') {
    updated = await prisma.userRole.update({
      where: { id },
      data: {
        status: 2,
        active_until: active_until ? new Date(active_until) : null,
        rejection_reason: null,
        downtime_until: null,
      },
    });

    const baseUrl = req.nextUrl.origin;

    await fetch(`${baseUrl}/api/email/send`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            to: entry.user.email,
            subject:
            decision === "approve"
                ? "Your Role Request Is Approved"
                : "Your Role Request Is Rejected",
            message:
            decision === "approve"
                ? "Congratulations! Your role request has been approved."
                : `Your role request was rejected.\nReason: ${rejection_reason}`,
        }),
        });
  }

  if (decision === 'reject') {
    updated = await prisma.userRole.update({
      where: { id },
      data: {
        status: 3,
        rejection_reason,
        downtime_until: downtime_until ? new Date(downtime_until) : null,
        active_until: null,
      },
    });

    const baseUrl = req.nextUrl.origin;

    await fetch(`${baseUrl}/api/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            to: entry.user.email,
            subject:
            decision === "approve"
                ? "Your Role Request Is Approved"
                : "Your Role Request Is Rejected",
            message:
            decision === "approve"
                ? "Congratulations! Your role request has been approved."
                : `Your role request was rejected.\nReason: ${rejection_reason}`,
        }),
        });

  }

  return NextResponse.json({ success: true, updated });
}
