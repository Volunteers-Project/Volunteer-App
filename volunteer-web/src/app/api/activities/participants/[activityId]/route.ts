import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await context.params;

    // =============================
    // Fetch all participants
    // =============================
    const participants = await prisma.activityParticipant.findMany({
      where: { activityId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        slots: true,
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    // =============================
    // Count per slot
    // =============================
    const slotCountsRaw = await prisma.activityParticipantSlot.groupBy({
      by: ["timeSlotId"],
      _count: { timeSlotId: true },
    });

    const slotCounts: Record<string, number> = {};
    slotCountsRaw.forEach((s) => {
      slotCounts[s.timeSlotId] = s._count.timeSlotId;
    });

    // =============================
    // Total participants (unique users)
    // =============================
    const totalParticipants = new Set(
      participants.map((p) => p.userId)
    ).size;

    return NextResponse.json({
      participants,
      slotCounts,
      totalParticipants,
    });
  } catch (error) {
    console.error("Error loading participants:", error);
    return NextResponse.json(
      { error: "Failed to load participant data" },
      { status: 500 }
    );
  }
}
