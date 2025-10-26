// src/app/api/user/[uuid]/roles/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_: Request, { params }: { params: { uuid: string } }) {
  const roles = await prisma.userRole.findMany({
    where: { user_uuid: params.uuid },
    include: { role: true },
  });

  return NextResponse.json(roles.map((r) => ({ name: r.role.name })));
}
