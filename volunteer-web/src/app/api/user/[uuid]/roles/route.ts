import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await context.params; // ✅ await the Promise

  try {
    const roles = await prisma.UserRole.findMany({
      where: { user_uuid: uuid },
      include: { role: true },
    });

    return NextResponse.json(roles.map((r) => ({ name: r.role.name })));
  } catch (err) {
    console.error('Error fetching roles:', err);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}
