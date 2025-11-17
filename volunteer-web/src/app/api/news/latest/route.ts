import { NextResponse } from "next/server";



import { prisma } from "@/lib/prisma";


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
