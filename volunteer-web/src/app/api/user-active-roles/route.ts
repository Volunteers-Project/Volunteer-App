import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Returns only ACTIVE or RENEWABLE roles
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_uuid = searchParams.get("user_uuid");

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
