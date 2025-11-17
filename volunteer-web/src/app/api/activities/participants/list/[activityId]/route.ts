import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { activityId: string } }
) {
  try {
    const activityId = params.activityId;

    const participants = await prisma.activityParticipant.findMany({
      where: { activityId },
      include: {
        user: true,
        slots: {
          include: {
            timeSlot: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    return NextResponse.json(participants);
  } catch (err) {
    console.error("[LIST PARTICIPANTS ERROR]", err);
    return NextResponse.json(
      { error: "Failed to load participants" },
      { status: 500 }
    );
  }
}
