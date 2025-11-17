import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

interface SlotInput {
  slotId: string;
  mealWanted?: boolean;
  mealReason?: string;
  transportWanted?: boolean;
  transportReason?: string;
}

interface JoinActivityBody {
  activityId: string;
  slots: SlotInput[];
}

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

    const body: JoinActivityBody = await req.json();
    const { activityId, slots } = body;

    if (!activityId || !Array.isArray(slots)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    // Ensure the activity exists
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        meal: true,
        transport: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // Create or find participant
    let participant = await prisma.activityParticipant.findUnique({
      where: {
        userId_activityId: {
          userId,
          activityId,
        },
      },
    });

    if (!participant) {
      participant = await prisma.activityParticipant.create({
        data: { userId, activityId },
      });
    }

    // Add or update slots
    for (const slot of slots) {
      const slotId = slot.slotId;

      // Capacity check
      const count = await prisma.activityParticipantSlot.count({
        where: { timeSlotId: slotId },
      });

      if (count >= activity.maxParticipants) {
        return NextResponse.json(
          { error: `Timeslot ${slotId} is full` },
          { status: 400 }
        );
      }

      const allowMeal = activity.meal?.provided ?? false;
      const allowTransport = activity.transport?.provided ?? false;

      await prisma.activityParticipantSlot.upsert({
        where: {
          participantId_timeSlotId: {
            participantId: participant.id,
            timeSlotId: slotId,
          },
        },
        create: {
          participantId: participant.id,
          timeSlotId: slotId,
          mealWanted: allowMeal ? slot.mealWanted : null,
          mealReason: allowMeal ? slot.mealReason : null,
          transportWanted: allowTransport ? slot.transportWanted : null,
          transportReason: allowTransport ? slot.transportReason : null,
        },
        update: {
          mealWanted: allowMeal ? slot.mealWanted : null,
          mealReason: allowMeal ? slot.mealReason : null,
          transportWanted: allowTransport ? slot.transportWanted : null,
          transportReason: allowTransport ? slot.transportReason : null,
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
