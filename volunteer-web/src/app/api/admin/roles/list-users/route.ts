import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";


export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") || "";
    const page = Number(req.nextUrl.searchParams.get("page") || 1);
    const rows = Number(req.nextUrl.searchParams.get("rows") || 25);

    // Step 1 — fetch all user UUIDs that have any roles
    const roleUserIds = await prisma.userRole.findMany({
      distinct: ["user_uuid"],
      select: { user_uuid: true },
    });

    const ids = roleUserIds.map((r) => r.user_uuid);

    // Step 2 — apply search + ids filter
    const whereUser: Prisma.UserWhereInput = {
      id: { in: ids },

      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    // Step 3 — safe count()
    const total = await prisma.user.count({ where: whereUser });

    // Step 4 — safe findMany()
    const users = await prisma.user.findMany({
      where: whereUser,
      include: {
        roles: {
          include: { role: true },
          orderBy: { created_at: "desc" },
        },
      },
      skip: (page - 1) * rows,
      take: rows,
      orderBy: { createdAt: "desc" },
    });

    const entries = users.map((u) => ({
      userId: u.id,
      username: u.username,
      email: u.email,
      createdAt: u.createdAt.toISOString(),
      roleCount: u.roles.length,
      hasPending: u.roles.some((r) => r.status === 1),
      roles: u.roles.map((r) => ({
        id: r.id,
        role_id: r.role_id,
        status: r.status,
        role_name: r.role.name,
        request_message: r.request_message,
        attachment_path: r.attachment_path,
        active_until: r.active_until,
        downtime_until: r.downtime_until,
        rejection_reason: r.rejection_reason,
        created_at: r.created_at.toISOString(),
      })),
    }));

    return NextResponse.json({
      entries,
      total,
      totalPages: Math.ceil(total / rows),
    });
  } catch (err) {
    console.error("ERROR list-users:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
