import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface UpdateSlotBody {
  participantSlotId: string;
  statusCode?: number | null;
  arrivalTime?: string | null;
  leaveTime?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body: UpdateSlotBody = await req.json();

    const {
      participantSlotId,
      statusCode,
      arrivalTime,
      leaveTime,
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

    return NextResponse.json({
      success: true,
      updated,
    });
  } catch (err) {
    console.error("[UPDATE PARTICIPANT SLOT ERROR]", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
