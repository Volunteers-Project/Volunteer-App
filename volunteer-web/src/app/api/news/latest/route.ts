import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const latest = await prisma.news.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        thumbnail: true,
        previewUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json(latest);
  } catch (err) {
    console.error("[GET LATEST NEWS ERROR]", err);
    return NextResponse.json(
      { error: "Failed to load latest news" },
      { status: 500 }
    );
  }
}
