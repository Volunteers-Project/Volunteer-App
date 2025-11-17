import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;  // ← FIX
    const newsId = Number(id);

    const activities = await prisma.activity.findMany({
      where: { newsId },
      include: {
        timeSlots: true,
        transport: true,
        meal: true,
        participants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(activities);
  } catch (err) {
    console.error("❌ Failed to load activities:", err);
    return NextResponse.json(
      { error: "Failed to load activities" },
      { status: 500 }
    );
  }
}
