import { NextResponse } from 'next/server';
import { PrismaClient, UserRole } from '@prisma/client';

import { prisma } from "@/lib/prisma";


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_uuid = searchParams.get('user_uuid');

    if (!user_uuid) {
      return NextResponse.json({ error: 'Missing user_uuid' }, { status: 400 });
    }

    // All role definitions
    const roles = await prisma.role.findMany();

    // All user role entries for this user
    const userRoles = await prisma.userRole.findMany({
      where: { user_uuid },
      orderBy: { created_at: 'desc' },
    });

    // Keep latest UserRole per role_id
    const latest: Record<number, UserRole> = {};
    for (const ur of userRoles) {
      if (!latest[ur.role_id]) latest[ur.role_id] = ur;
    }

    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const result = roles.map((role) => {
      const ur = latest[role.id];

      // 0 - never had
      if (!ur) {
        return {
          ...role,
          userStatus: 0,
          details: null,
          canApply: true,
        };
      }

      // Numeric statuses come from DB now
      const status = ur.status;

      // 1 - Pending
      if (status === 1) {
        return {
          ...role,
          userStatus: 1,
          details: {
            created_at: ur.created_at.toISOString(),
          },
          canApply: false,
        };
      }

      // 2 - Active or 5 - Renewable
      if (status === 2) {
        const active_until = ur.active_until;
        const renewable =
          active_until && new Date(active_until) <= in30Days;

        return {
          ...role,
          userStatus: renewable ? 5 : 2,
          details: {
            active_until: active_until?.toISOString() ?? null,
            created_at: ur.created_at.toISOString(),
          },
          canApply: renewable,
        };
      }

      // 3 - Rejected
      if (status === 3) {
        const canReapply =
          !ur.downtime_until || new Date(ur.downtime_until) <= now;

        return {
          ...role,
          userStatus: 3,
          details: {
            downtime_until: ur.downtime_until?.toISOString() ?? null,
            rejection_reason: ur.rejection_reason ?? null,
          },
          canApply: canReapply,
        };
      }

      // 4 - Expired
      if (status === 4) {
        const canReapply =
          !ur.downtime_until || new Date(ur.downtime_until) <= now;

        return {
          ...role,
          userStatus: 4,
          details: {
            expiry_date: ur.active_until?.toISOString() ?? null,
          },
          canApply: canReapply,
        };
      }

      // fallback
      return {
        ...role,
        userStatus: 9,
        details: null,
        canApply: false,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
