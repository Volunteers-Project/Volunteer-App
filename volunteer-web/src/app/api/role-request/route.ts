import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Allowed MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_uuid, role_id, message, attachment_url, fileType, fileSize } = body;

    if (!user_uuid || !role_id) {
      return NextResponse.json(
        { error: 'Missing required fields: user_uuid or role_id' },
        { status: 400 }
      );
    }

    // ⛔ Validate attachment type & size
    if (attachment_url && fileType && fileSize) {
      if (!ALLOWED_TYPES.includes(fileType)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only JPG, PNG, or PDF allowed.' },
          { status: 400 }
        );
      }

      if (fileSize > MAX_SIZE) {
        return NextResponse.json(
          { error: 'File is too large. Maximum size is 5MB.' },
          { status: 400 }
        );
      }
    }

    // ⛔ Check if user is actively holding or on cooldown for this role
    const existing = await prisma.userRole.findFirst({
      where: {
        user_uuid,
        role_id,
        OR: [
          // Active → status = 2
          {
            status: 2,
            active_until: { gt: new Date() }
          },
          // Cooldown → downtime_until in the future
          {
            downtime_until: { gt: new Date() }
          }
        ]
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This role is active or currently in cooldown.' },
        { status: 400 }
      );
    }

    // 📝 Upsert new pending request (status = 1)
    const roleRequest = await prisma.userRole.upsert({
      where: { user_uuid_role_id: { user_uuid, role_id } },
      update: {
        status: 1, // pending
        request_message: message || null,
        attachment_path: attachment_url || null,
        updated_at: new Date()
      },
      create: {
        user_uuid,
        role_id,
        status: 1,
        request_message: message || null,
        attachment_path: attachment_url || null
      }
    });

    return NextResponse.json({ success: true, id: roleRequest.id });
  } catch (err) {
    console.error('Error submitting role request:', err);
    return NextResponse.json(
      { error: 'Failed to submit request. Please try again later.' },
      { status: 500 }
    );
  }
}
