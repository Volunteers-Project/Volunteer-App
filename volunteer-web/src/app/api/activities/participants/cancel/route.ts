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
  const { activityId, slotIds } = body;

  if (!activityId || !Array.isArray(slotIds))
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const participant = await prisma.activityParticipant.findUnique({
    where: {
      userId_activityId: {
        userId,
        activityId,
      },
    },
    include: { slots: true },
  });

  if (!participant)
    return NextResponse.json({ error: "No registration found" }, { status: 400 });

  // Delete specified slot rows
  await prisma.activityParticipantSlot.deleteMany({
    where: {
      participantId: participant.id,
      timeSlotId: { in: slotIds },
    },
  });

  // Optionally remove participant row if empty
  const countRemaining = await prisma.activityParticipantSlot.count({
    where: { participantId: participant.id },
  });

  if (countRemaining === 0) {
    await prisma.activityParticipant.delete({
      where: { id: participant.id },
    });
  }

  return NextResponse.json({ success: true });
}
