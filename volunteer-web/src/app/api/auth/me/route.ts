import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user_uuid = cookieStore.get("user_id")?.value;

    if (!user_uuid) {
      return NextResponse.json(
        { error: "Not logged in" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: user_uuid },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("auth/me error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
