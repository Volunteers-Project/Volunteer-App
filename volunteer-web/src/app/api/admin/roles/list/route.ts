import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import { prisma } from "@/lib/prisma";


export async function GET(req: NextRequest) {
  try {
    const page = Number(req.nextUrl.searchParams.get('page') || '1');
    const search = req.nextUrl.searchParams.get('search') || '';
    const pageSize = 50;

    const roles = await prisma.userRole.findMany({
      where: {
        OR: [
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { username: { contains: search, mode: 'insensitive' } } },
        ],
      },
      include: {
        user: true,
        role: true,
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json(roles);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load roles' }, { status: 500 });
  }
}
