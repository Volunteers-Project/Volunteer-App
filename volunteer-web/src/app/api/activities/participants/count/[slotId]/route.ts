import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { slotId: string } }
) {
  const { slotId } = params;

  const count = await prisma.activityParticipantSlot.count({
    where: { timeSlotId: slotId },
  });

  return NextResponse.json({ slotId, count });
}
