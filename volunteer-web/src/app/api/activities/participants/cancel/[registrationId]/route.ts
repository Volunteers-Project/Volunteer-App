import { NextRequest, NextResponse } from "next/server";


import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";


export async function DELETE(
  _req: NextRequest,
  { params }: { params: { registrationId: string } }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Ensure user owns this registration
    const record = await prisma.activityParticipant.findUnique({
      where: { id: params.registrationId },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    if (record.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Cascade delete will remove all slots
    await prisma.activityParticipant.delete({
      where: { id: params.registrationId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500 }
    );
  }
}
