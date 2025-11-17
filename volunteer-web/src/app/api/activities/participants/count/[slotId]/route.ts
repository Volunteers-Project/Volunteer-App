import { NextResponse } from "next/server";



import { prisma } from "@/lib/prisma";


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
