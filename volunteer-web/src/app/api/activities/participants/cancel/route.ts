import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { activityId, slotIds } = body as {
      activityId: string;
      slotIds: string[];
    };

    if (!activityId || !Array.isArray(slotIds)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const participant = await prisma.activityParticipant.findUnique({
      where: {
        userId_activityId: {
          userId,
          activityId,
        },
      },
      include: { slots: true },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "No registration found" },
        { status: 400 }
      );
    }

    // Delete selected slot rows
    await prisma.activityParticipantSlot.deleteMany({
      where: {
        participantId: participant.id,
        timeSlotId: { in: slotIds },
      },
    });

    // Remove participant row if no slots left
    const remaining = await prisma.activityParticipantSlot.count({
      where: { participantId: participant.id },
    });

    if (remaining === 0) {
      await prisma.activityParticipant.delete({
        where: { id: participant.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST REMOVE SLOTS ERROR]", err);
    return NextResponse.json(
      { error: "Failed to update slots" },
      { status: 500 }
    );
  }
}
