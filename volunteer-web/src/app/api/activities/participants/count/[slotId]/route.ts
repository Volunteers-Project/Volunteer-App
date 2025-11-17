import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await context.params;

    const count = await prisma.activityParticipantSlot.count({
      where: { timeSlotId: slotId },
    });

    return NextResponse.json({ slotId, count });
  } catch (err) {
    console.error("[GET SLOT COUNT ERROR]", err);
    return NextResponse.json(
      { error: "Failed to load slot count" },
      { status: 500 }
    );
  }
}
