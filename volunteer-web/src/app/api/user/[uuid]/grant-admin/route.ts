// src/app/api/user/[uuid]/grant-admin/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(_: Request, { params }: { params: { uuid: string } }) {
  try {
    // Find admin role ID
    const adminRole = await prisma.role.findUnique({
      where: { name: "admin" },
    });

    if (!adminRole) {
      return NextResponse.json({ error: "Admin role not found" }, { status: 400 });
    }

    // Assign role to user (if not already assigned)
    await prisma.userRole.upsert({
      where: {
        user_uuid_role_id: {
          user_uuid: params.uuid,
          role_id: adminRole.id,
        },
      },
      update: {},
      create: {
        user_uuid: params.uuid,
        role_id: adminRole.id,
      },
    });

    return NextResponse.json({ success: true, message: "Admin role granted successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
