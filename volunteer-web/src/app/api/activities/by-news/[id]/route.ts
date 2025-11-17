import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const newsId = Number(params.id);

  try {
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
