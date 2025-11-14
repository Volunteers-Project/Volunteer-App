import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function GET() {

  const cookieStore = await cookies();
  const user_uuid = cookieStore.get("user_id")?.value;

  if (!user_uuid) {
    return NextResponse.json({ isAdmin: false });
  }

  const admin = await prisma.userRole.findFirst({
    where: {
      user_uuid,
      role_id: 1,
      status: 2,
      active_until: { gt: new Date() },
    },
  });

  return NextResponse.json({ isAdmin: Boolean(admin) });
}
