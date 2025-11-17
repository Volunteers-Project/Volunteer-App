import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const newsId = Number(id);
    if (isNaN(newsId)) {
      return NextResponse.json(
        { error: "Invalid news ID" },
        { status: 400 }
      );
    }

    const news = await prisma.news.findUnique({
      where: { id: newsId },
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
  } catch (err) {
    console.error("[GET NEWS ERROR]", err);
    return NextResponse.json(
      { error: "Failed to load news" },
      { status: 500 }
    );
  }
}
