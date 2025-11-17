import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const latest = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      thumbnail: true,
      previewUrl: true,
      createdAt: true,
    }
  });

  return NextResponse.json(latest);
}
