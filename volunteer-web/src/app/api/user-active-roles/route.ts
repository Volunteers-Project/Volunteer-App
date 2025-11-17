import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// Returns only ACTIVE or RENEWABLE roles
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cookieStore = await cookies();
  const user_uuid = cookieStore.get("user_id")?.value;

  if (!user_uuid) {
    return NextResponse.json({ error: "Missing user_uuid" }, { status: 400 });
  }

  const roles = await prisma.userRole.findMany({
    where: {
      user_uuid,
      status: { in: [2, 5] }, // 2=active, 5=renewable
    },
    include: { role: true }, 
  });

  return NextResponse.json(roles.map(r => ({
    id: r.role.id,
    name: r.role.name,
  })));
}
