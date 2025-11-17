import { NextResponse } from "next/server";



import { prisma } from "@/lib/prisma";


interface SlotSelection {
  timeSlotId: string;
  mealWanted?: boolean;
  mealReason?: string;
  transportWanted?: boolean;
  transportReason?: string;
}

interface JoinBody {
  activityId: string;
  userId: string;
  slotSelections: SlotSelection[];
}

export async function POST(req: Request) {
  try {
    const body: JoinBody = await req.json();
    const { activityId, userId, slotSelections } = body;

    // 🟦 Ensure participant exists
    const participant = await prisma.activityParticipant.upsert({
      where: {
        userId_activityId: {
          userId,
          activityId,
        },
      },
      update: {},
      create: {
        userId,
        activityId,
      },
    });

    // 🟧 Create/update slot relations
    for (const s of slotSelections) {
      await prisma.activityParticipantSlot.upsert({
        where: {
          participantId_timeSlotId: {
            participantId: participant.id,
            timeSlotId: s.timeSlotId,
          },
        },
        update: {
          mealWanted: s.mealWanted,
          mealReason: s.mealReason,
          transportWanted: s.transportWanted,
          transportReason: s.transportReason,
        },
        create: {
          participantId: participant.id,
          timeSlotId: s.timeSlotId,
          mealWanted: s.mealWanted,
          mealReason: s.mealReason,
          transportWanted: s.transportWanted,
          transportReason: s.transportReason,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[JOIN ACTIVITY ERROR]", err);
    return NextResponse.json(
      { error: "Failed to join activity" },
      { status: 500 }
    );
  }
}
