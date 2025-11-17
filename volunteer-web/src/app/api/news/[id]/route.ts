import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  const { params } = context;

  const news = await prisma.news.findUnique({
    where: { id: Number(params.id) },
    select: {
      id: true,
      title: true,
      fileUrl: true,
      thumbnail: true,
      previewUrl: true,
      tags: true,
      createdAt: true,
    },
  });

  if (!news) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(news);
}
