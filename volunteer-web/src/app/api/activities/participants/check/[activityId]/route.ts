import { NextResponse } from "next/server";


import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";


export async function GET(req: Request, context: { params: { activityId: string } }) {
  const params = await context.params;
  const activityId = params.activityId;

  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 1. Find participant rows
  const participant = await prisma.activityParticipant.findUnique({
    where: {
      userId_activityId: { userId, activityId },
    },
    include: {
      slots: {
        include: {
          timeSlot: true,
        },
      },
    },
  });

  // 2. Count participants per slot
  const slotCounts = await prisma.activityParticipantSlot.groupBy({
    by: ["timeSlotId"],
    _count: { timeSlotId: true },
  });

  const countsMap = Object.fromEntries(
    slotCounts.map((s) => [s.timeSlotId, s._count.timeSlotId])
  );

  return NextResponse.json({
    joined: !!participant,

    joinedSlotDetails:
      participant?.slots.map((ps) => ({
        slotId: ps.timeSlotId,
        participantSlotId: ps.id,
        date: ps.timeSlot.date,
        startTime: ps.timeSlot.startTime,
        endTime: ps.timeSlot.endTime,
        mealWanted: ps.mealWanted,
        transportWanted: ps.transportWanted,
      })) ?? [],

    slotCounts: countsMap,
  });
}
