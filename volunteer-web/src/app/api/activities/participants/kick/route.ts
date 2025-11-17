import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface KickBody {
  participantId: string;
  activityId: string;
  reason: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: KickBody = await req.json();
    const { participantId, activityId, reason } = body;

    if (!participantId || !activityId || !reason) {
      return NextResponse.json(
        { error: "Missing participantId, activityId, or reason." },
        { status: 400 }
      );
    }

    // Validate participant belongs to the activity
    const participant = await prisma.activityParticipant.findUnique({
      where: { id: participantId },
      include: { slots: true },
    });

    if (!participant || participant.activityId !== activityId) {
      return NextResponse.json(
        { error: "Participant not found for this activity." },
        { status: 404 }
      );
    }

    // Transaction: remove participant + log kick
    await prisma.$transaction([
      prisma.activityParticipantSlot.deleteMany({
        where: { participantId },
      }),

      prisma.activityParticipant.delete({
        where: { id: participantId },
      }),

      prisma.activityKickLog.create({
        data: {
          participantId,
          activityId,
          reason,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[KICK PARTICIPANT ERROR]", err);
    return NextResponse.json(
      { error: "Failed to kick participant." },
      { status: 500 }
    );
  }
}
