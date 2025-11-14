import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") || "";
    const page = Number(req.nextUrl.searchParams.get("page") || 1);
    const rows = Number(req.nextUrl.searchParams.get("rows") || 50);

    const whereClause: Prisma.UserRoleWhereInput = {
      status: 1, // pending
      ...(search
        ? {
            OR: [
              {
                user: {
                  email: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
              {
                user: {
                  username: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {}),
    };

    const total = await prisma.userRole.count({ where: whereClause });

    const entries = await prisma.userRole.findMany({
      where: whereClause,
      include: {
        user: { select: { email: true, username: true } },
        role: { select: { name: true } },
      },
      skip: (page - 1) * rows,
      take: rows,
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      entries,
      total,
      totalPages: Math.ceil(total / rows),
    });
  } catch (err) {
    console.error("ERROR list-pending:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
