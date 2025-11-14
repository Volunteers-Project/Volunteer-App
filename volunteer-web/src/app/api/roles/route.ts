import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_uuid = searchParams.get('user_uuid');

  try {
    const allRoles = await prisma.role.findMany({
      select: { id: true, name: true},
    });

    if (!user_uuid) return NextResponse.json(allRoles);

    // Get roles that the user already holds or is cooling down
    const blocked = await prisma.userRole.findMany({
      where: {
        user_uuid,
        OR: [
          { status: 'active', active_until: { gt: new Date() } },
          { downtime_until: { gt: new Date() } },
        ],
      },
      select: { role_id: true },
    });

    const blockedIds = new Set(blocked.map((r) => r.role_id));
    const available = allRoles.filter((r) => !blockedIds.has(r.id));

    return NextResponse.json(available);
  } catch (err) {
    console.error('Error fetching roles:', err);
    return NextResponse.json({ error: 'Failed to load roles' }, { status: 500 });
  }
}
