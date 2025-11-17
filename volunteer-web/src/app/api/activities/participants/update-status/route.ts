import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      participantSlotId,
      statusCode,
      arrivalTime,
      leaveTime,
    }: {
      participantSlotId: string;
      statusCode?: number | null;
      arrivalTime?: string | null;
      leaveTime?: string | null;
    } = body;

    if (!participantSlotId) {
      return NextResponse.json(
        { error: "Missing participantSlotId" },
        { status: 400 }
      );
    }

    const updated = await prisma.activityParticipantSlot.update({
      where: { id: participantSlotId },
      data: {
        statusCode: statusCode ?? null,
        arrivalTime: arrivalTime ?? undefined,
        leaveTime: leaveTime ?? undefined,
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error("Error updating participant slot:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
