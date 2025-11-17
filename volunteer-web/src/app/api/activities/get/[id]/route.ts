import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: activityId } = await context.params;

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        timeSlots: true,
        transport: true,
        meal: true,
        participants: {
          include: {
            user: true,
            slots: {
              include: {
                timeSlot: true,
              },
            },
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (err) {
    console.error("[GET ACTIVITY ERROR]", err);
    return NextResponse.json(
      { error: "Failed to load activity" },
      { status: 500 }
    );
  }
}
