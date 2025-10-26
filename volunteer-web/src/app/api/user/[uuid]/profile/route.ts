import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_: Request, { params }: { params: { uuid: string } }) {
  try {
    const profile = await prisma.volunteerProfile.findFirst({
      where: { userId: params.uuid },
      include: {
        locations: true,
        schedules: true, // ✅ Include new relation
      },
    });

    // Return empty object if no profile exists
    return NextResponse.json(profile || {});
  } catch (err) {
    console.error('Error fetching profile:', err);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { uuid: string } }) {
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
      locations,
      schedules,
      isPrivate, // ✅ renamed from profilePrivate
      receiveNotifications,
    } = body;

    // 🧩 Upsert main profile
    const profile = await prisma.volunteerProfile.upsert({
      where: { userId: params.uuid },
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
        isPrivate,
        receiveNotifications,
      },
      create: {
        userId: params.uuid,
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
        isPrivate,
        receiveNotifications,
      },
      include: { locations: true, schedules: true },
    });

    // 🗺️ Update locations
    if (Array.isArray(locations)) {
      await prisma.volunteerLocation.deleteMany({
        where: { userId: params.uuid },
      });

      if (locations.length > 0) {
        await prisma.volunteerLocation.createMany({
          data: locations.map((loc: { region: string; area: string }) => ({
            userId: params.uuid,
            region: loc.region,
            area: loc.area,
            volunteerProfileId: profile.id,
          })),
        });
      }
    }

    // 🕒 Update schedules
    if (Array.isArray(schedules)) {
      await prisma.volunteerSchedule.deleteMany({
        where: { volunteerProfileId: profile.id },
      });

      interface ScheduleInput {
        dayCode: number;
        startTime: string;
        endTime: string;
      }

      const validSchedules = (schedules as ScheduleInput[])
        .filter(
          (s) =>
            typeof s.dayCode === 'number' &&
            s.startTime &&
            s.endTime
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
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
