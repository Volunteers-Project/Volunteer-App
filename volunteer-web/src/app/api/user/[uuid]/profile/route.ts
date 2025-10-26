import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🧩 GET handler
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await context.params;

  try {
    const profile = await prisma.volunteerProfile.findFirst({
      where: { userId: uuid },
      include: {
        locations: true,
        schedules: true, // only if you have VolunteerSchedule relation
      },
    });

    return NextResponse.json(profile || {});
  } catch (err) {
    console.error('Error fetching profile:', err);
    return NextResponse.json(
      { error: 'Failed to load profile' },
      { status: 500 }
    );
  }
}

// 🧩 POST handler
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await context.params;

  try {
    const body = await req.json();

    const {
      name,
      genderCode,
      dateOfBirth,
      statusCode,
      phone,
      workPhone,
      lineId,
      whatsapp,
      wechat,
      email,
      volunteerScaleCode,
      preferredWorks,
      profilePrivate,
      receiveNotifications,
      locations,
      schedules,
    } = body;

    const profile = await prisma.volunteerProfile.upsert({
      where: { userId: uuid },
      update: {
        name,
        genderCode,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        statusCode,
        phone,
        workPhone,
        lineId,
        whatsapp,
        wechat,
        email,
        volunteerScaleCode,
        preferredWorks,
        profilePrivate,
        receiveNotifications,
      },
      create: {
        userId: uuid,
        name,
        genderCode,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        statusCode,
        phone,
        workPhone,
        lineId,
        whatsapp,
        wechat,
        email,
        volunteerScaleCode,
        preferredWorks,
        profilePrivate,
        receiveNotifications,
      },
      include: { locations: true },
    });

    // Optional: handle locations
    if (Array.isArray(locations)) {
      await prisma.volunteerLocation.deleteMany({ where: { userId: uuid } });
      if (locations.length > 0) {
        await prisma.volunteerLocation.createMany({
          data: locations.map((loc: { region: string; area: string }) => ({
            userId: uuid,
            region: loc.region,
            area: loc.area,
            volunteerProfileId: profile.id,
          })),
        });
      }
    }

    // Optional: handle schedules
    if (Array.isArray(schedules)) {
      await prisma.volunteerSchedule.deleteMany({
        where: { volunteerProfileId: profile.id },
      });
      const validSchedules = schedules
        .filter(
          (s: {
            dayCode: number;
            startTime: string;
            endTime: string;
          }) => s.dayCode && s.startTime && s.endTime
        )
        .map((s) => ({
          volunteerProfileId: profile.id,
          dayCode: s.dayCode,
          startTime: s.startTime,
          endTime: s.endTime,
        }));
      if (validSchedules.length > 0)
        await prisma.volunteerSchedule.createMany({ data: validSchedules });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error saving profile:', err);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    );
  }
}
