import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_uuid = searchParams.get('user_uuid');

  try {
    const allRoles = await prisma.role.findMany({
      select: { id: true, name: true },
    });

    if (!user_uuid) return NextResponse.json(allRoles);

    // Get roles the user cannot apply for
    const blocked = await prisma.userRole.findMany({
      where: {
        user_uuid,
        OR: [
          {
            status: 2, // ACTIVE
            active_until: { gt: new Date() },
          },
          {
            status: 3, // REJECTED but with downtime
            downtime_until: { gt: new Date() },
          },
          {
            status: 5, // RENEWABLE (still can't apply again)
            active_until: { gt: new Date() },
          },
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
