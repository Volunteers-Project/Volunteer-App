"use client";

import type { ActivityDetails } from "@/types/activities";

export const WorkTypeMap: Record<number, string> = {
  1: "Cooking",
  2: "Hard Labor",
  3: "Medical Assistance",
  4: "Distribution",
  5: "Logistics",
};

export default function TabInfo({ activity }: { activity: ActivityDetails }) {
  return (
    <div className="space-y-12">

      {/* HEADER */}
      <section className="pb-5 border-b">
        <h1 className="text-3xl font-bold text-gray-800">{activity.title}</h1>
        <p className="text-gray-500 mt-1">
          Created on {new Date(activity.createdAt).toLocaleString()}
        </p>
      </section>

      {/* BASIC INFORMATION */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>

        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">

          <div>
            <p className="text-gray-600 text-sm font-medium">Description</p>
            <p className="mt-1 text-gray-800">{activity.description || "—"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t">
            <div>
              <p className="text-gray-600 text-sm font-medium">Work Type</p>
              <p className="mt-1 text-gray-800">
                {activity.workTypeCode
                  ? WorkTypeMap[activity.workTypeCode] || "Unknown"
                  : "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-sm font-medium">Participants Range</p>
              <p className="mt-1 text-gray-800">
                {activity.minParticipants}–{activity.maxParticipants}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATIONS */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Locations</h2>

        <div className="bg-white rounded-xl border p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Meeting */}
          <div className="space-y-1">
            <p className="text-gray-600 text-sm font-medium">Meeting Location</p>
            <p className="text-gray-800">{activity.meetingLocation}</p>

            {(activity.meetingLat && activity.meetingLng) && (
              <p className="text-sm text-gray-500">
                Lat: {activity.meetingLat} | Lng: {activity.meetingLng}
              </p>
            )}
          </div>

          {/* Volunteer */}
          <div className="space-y-1">
            <p className="text-gray-600 text-sm font-medium">Volunteer Location</p>
            <p className="text-gray-800">{activity.volunteerLocation}</p>

            {(activity.volunteerLat && activity.volunteerLng) && (
              <p className="text-sm text-gray-500">
                Lat: {activity.volunteerLat} | Lng: {activity.volunteerLng}
              </p>
            )}
          </div>

        </div>
      </section>

      {/* FACILITIES */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Facilities</h2>

        <div className="bg-white rounded-xl border p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Meal */}
          <div>
            <p className="text-gray-600 text-sm font-medium">Meal</p>
            {!activity.meal?.provided ? (
              <p className="mt-1 text-gray-500">Not provided</p>
            ) : (
              <p className="mt-1 text-gray-800">
                {activity.meal.isPaid
                  ? `Paid — ${activity.meal.fee} ${activity.meal.currency}`
                  : "Free"}
              </p>
            )}
          </div>

          {/* Transport */}
          <div>
            <p className="text-gray-600 text-sm font-medium">Transportation</p>
            {!activity.transport?.provided ? (
              <p className="mt-1 text-gray-500">Not provided</p>
            ) : (
              <p className="mt-1 text-gray-800">
                {activity.transport.isPaid
                  ? `Paid — ${activity.transport.fee} ${activity.transport.currency}`
                  : "Free"}
              </p>
            )}
          </div>

        </div>
      </section>

      {/* TIME SLOTS */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Time Slots</h2>

        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-3">
          {activity.timeSlots.length === 0 && (
            <p className="text-gray-500">No time slots defined.</p>
          )}

          {activity.timeSlots.map((slot) => (
            <div
              key={slot.id}
              className="border rounded-lg p-4 bg-gray-50 flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-gray-800">{slot.date}</p>
                <p className="text-gray-600 text-sm">
                  {slot.startTime} → {slot.endTime}
                </p>
              </div>
              <p className="text-gray-500 text-sm">Day: {slot.dayCode}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
