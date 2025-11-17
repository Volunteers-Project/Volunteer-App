import { NextRequest, NextResponse } from "next/server";



import { prisma } from "@/lib/prisma";


export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: {
        timeSlots: {
          include: { slots: true },
        },
        meal: true,
        transport: true,
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
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
