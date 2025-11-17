"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ActivityDetails,
  ActivityParticipant,
  ParticipantSlot,
  TimeSlot,
} from "@/types/activities";

type ViewMode = "slot" | "participant";

interface Props {
  activity: ActivityDetails;
}

export default function TabOrganizerParticipants({ activity }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("slot");
  const [loading, setLoading] = useState(true);
  const [participantData, setParticipantData] = useState<ActivityParticipant[]>([]);

  // =====================================================
  // Fetch participants (fully typed)
  // =====================================================
  const load = useCallback(async () => {
    const res = await fetch(`/api/activities/participants/${activity.id}`);
    const json: ActivityParticipant[] = await res.json();
    setParticipantData(json);
    setLoading(false);
  }, [activity.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <div className="text-gray-500">Loading…</div>;
  }

  return (
    <div className="space-y-6">

      {/* ===========================
          TOGGLE BUTTONS
      ============================ */}
      <div className="flex gap-3">
        <button
          onClick={() => setViewMode("slot")}
          className={`px-4 py-2 rounded-lg border ${
            viewMode === "slot"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-300"
          }`}
        >
          Group by Time Slot
        </button>

        <button
          onClick={() => setViewMode("participant")}
          className={`px-4 py-2 rounded-lg border ${
            viewMode === "participant"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-300"
          }`}
        >
          Group by Participant
        </button>
      </div>

      {/* ===========================
          VIEW A — GROUP BY SLOT
      ============================ */}
      {viewMode === "slot" && (
        <div className="space-y-8">
          {activity.timeSlots.map((slot: TimeSlot) => {
            const slotParticipants = participantData.filter((p) =>
              p.slots.some((s: ParticipantSlot) => s.timeSlotId === slot.id)
            );

            return (
              <div key={slot.id} className="border rounded-xl p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-3">
                  {slot.date} — {slot.startTime} → {slot.endTime}
                </h3>

                {slotParticipants.length === 0 ? (
                  <p className="text-gray-500">No participants yet.</p>
                ) : (
                  <div className="space-y-3">
                    {slotParticipants.map((p) => {
                      const slotEntry = p.slots.find(
                        (s: ParticipantSlot) => s.timeSlotId === slot.id
                      );

                      if (!slotEntry) return null;

                      return (
                        <div
                          key={`${p.id}-${slot.id}`}
                          className="p-4 bg-white rounded-lg border"
                        >
                          <p className="font-medium">{p.user.username}</p>

                          <div className="text-sm text-gray-600 mt-1 space-y-1">
                            <p>
                              Meal:{" "}
                              {slotEntry.mealWanted
                                ? "Wants meal"
                                : `No (${slotEntry.mealReason ?? "No reason"})`}
                            </p>

                            <p>
                              Transport:{" "}
                              {slotEntry.transportWanted
                                ? "Wants transport"
                                : `No (${slotEntry.transportReason ?? "No reason"})`}
                            </p>

                            <p>Status: {slotEntry.statusCode ?? "Unset"}</p>

                            {slotEntry.arrivalTime && (
                              <p>
                                Arrival:{" "}
                                {new Date(slotEntry.arrivalTime).toLocaleString()}
                              </p>
                            )}

                            {slotEntry.leaveTime && (
                              <p>
                                Leave:{" "}
                                {new Date(slotEntry.leaveTime).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ===========================
          VIEW B — GROUP BY PARTICIPANT
      ============================ */}
      {viewMode === "participant" && (
        <div className="space-y-8">
          {participantData.map((p) => (
            <div key={p.id} className="border rounded-xl p-6 bg-gray-50">
              <h3 className="text-xl font-semibold mb-2">
                {p.user.username}
              </h3>

              <div className="space-y-3">
                {p.slots.map((slot: ParticipantSlot) => {
                  const slotInfo = activity.timeSlots.find(
                    (t) => t.id === slot.timeSlotId
                  );

                  if (!slotInfo) return null;

                  return (
                    <div
                      key={slot.id}
                      className="p-4 bg-white rounded-lg border"
                    >
                      <p className="font-medium text-gray-800">
                        {slotInfo.date} — {slotInfo.startTime} →{" "}
                        {slotInfo.endTime}
                      </p>

                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        <p>
                          Meal:{" "}
                          {slot.mealWanted
                            ? "Wants meal"
                            : `No (${slot.mealReason ?? "No reason"})`}
                        </p>

                        <p>
                          Transport:{" "}
                          {slot.transportWanted
                            ? "Wants transport"
                            : `No (${slot.transportReason ?? "No reason"})`}
                        </p>

                        <p>Status: {slot.statusCode ?? "Unset"}</p>

                        {slot.arrivalTime && (
                          <p>
                            Arrival:{" "}
                            {new Date(slot.arrivalTime).toLocaleString()}
                          </p>
                        )}

                        {slot.leaveTime && (
                          <p>
                            Leave:{" "}
                            {new Date(slot.leaveTime).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
