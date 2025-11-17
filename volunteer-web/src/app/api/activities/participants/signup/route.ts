import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { activityId, slots } = body;

  if (!activityId || !Array.isArray(slots))
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  // Ensure the activity exists
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      meal: true,
      transport: true,
    },
  });

  if (!activity)
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });

  // Create or get participant row
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
      data: {
        userId,
        activityId,
      },
    });
  }

  // Add new slots
  for (const slot of slots) {
    const slotId = slot.slotId;

    // Check capacity
    const count = await prisma.activityParticipantSlot.count({
      where: { timeSlotId: slotId },
    });

    if (count >= activity.maxParticipants) {
      return NextResponse.json(
        { error: `Timeslot ${slotId} is full` },
        { status: 400 }
      );
    }

    // Insert if not already joined
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
        mealWanted: activity.meal?.provided ? slot.mealWanted : null,
        mealReason: activity.meal?.provided ? slot.mealReason : null,
        transportWanted: activity.transport?.provided
          ? slot.transportWanted
          : null,
        transportReason: activity.transport?.provided
          ? slot.transportReason
          : null,
      },
      update: {
        mealWanted: activity.meal?.provided ? slot.mealWanted : null,
        mealReason: activity.meal?.provided ? slot.mealReason : null,
        transportWanted: activity.transport?.provided
          ? slot.transportWanted
          : null,
        transportReason: activity.transport?.provided
          ? slot.transportReason
          : null,
      },
    });
  }

  return NextResponse.json({ success: true });
}
