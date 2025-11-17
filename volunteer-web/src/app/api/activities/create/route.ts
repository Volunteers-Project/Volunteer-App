import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Type for time slot
interface TimeSlotPayload {
  dayCode: number;
  date: string;
  startTime: string;
  endTime: string;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const {
      title,
      description,
      workTypeCode,
      minParticipants,
      maxParticipants,

      meetingLocationText,
      meetingLat,
      meetingLng,

      volunteerLocationText,
      volunteerLat,
      volunteerLng,

      transportationProvided,
      transportIsFree,
      transportFee,
      transportCurrency,

      mealProvided,
      mealIsFree,
      mealFee,
      mealCurrency,

      timeSlots,
      newsId,
    } = data;

    // ======================================================
    // 1. Create the Activity
    // ======================================================
    const activity = await prisma.activity.create({
      data: {
        newsId,
        title,
        description,

        meetingLocation: meetingLocationText,
        meetingLat,
        meetingLng,

        volunteerLocation: volunteerLocationText,
        volunteerLat,
        volunteerLng,

        minParticipants,
        maxParticipants,

        workTypes: workTypeCode ? [workTypeCode] : [],

        // TODO replace this later with real user ID
        createdBy: "00000000-0000-0000-0000-000000000000",
      },
    });

    // ======================================================
    // 2. Create Timeslots
    // ======================================================
    if (Array.isArray(timeSlots) && timeSlots.length > 0) {
      await prisma.activityTimeSlot.createMany({
        data: timeSlots.map((ts: TimeSlotPayload) => ({
          activityId: activity.id,
          dayCode: ts.dayCode,
          date: ts.date,
          startTime: ts.startTime,
          endTime: ts.endTime,
        })),
      });
    }

    // ======================================================
    // 3. Create Transportation
    // ======================================================
    await prisma.activityTransport.create({
      data: {
        activityId: activity.id,
        provided: transportationProvided,
        isPaid: transportationProvided ? !transportIsFree : false,
        fee: transportationProvided && !transportIsFree ? transportFee : null,
        currency:
          transportationProvided && !transportIsFree
            ? transportCurrency // string is fine
            : null,
      },
    });

    // ======================================================
    // 4. Create Meal
    // ======================================================
    await prisma.activityMeal.create({
      data: {
        activityId: activity.id,
        provided: mealProvided,
        isPaid: mealProvided ? !mealIsFree : false,
        fee: mealProvided && !mealIsFree ? mealFee : null,
        currency:
          mealProvided && !mealIsFree
            ? mealCurrency // string is fine
            : null,
      },
    });

    return NextResponse.json(
      { success: true, activityId: activity.id },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ CREATE ACTIVITY FAILED", err);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
