"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ActivityDetails,
  ActivityParticipant,
  ParticipantSlot,
  TimeSlot,
} from "@/types/activities";
import KickButton from "@/components/KickButton";

type ViewMode = "slot" | "participant";

interface Props {
  activity: ActivityDetails;
}

export default function TabOrganizerParticipants({ activity }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("slot");
  const [loading, setLoading] = useState(true);
  const [participantData, setParticipantData] = useState<ActivityParticipant[]>([]);
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [totalParticipants, setTotalParticipants] = useState<number>(0);

  const load = useCallback(async () => {
    const res = await fetch(`/api/activities/participants/${activity.id}`);
    const json = await res.json();

    // Correct assignments
    setParticipantData(json.participants);       // array
    setSlotCounts(json.slotCounts);             // record<string, number>
    setTotalParticipants(json.totalParticipants); // number

    setLoading(false);
  }, [activity.id]);


  useEffect(() => {
    load();
  }, [load]);

  // =====================================================
  // Update participant slot status
  // =====================================================
  async function updateParticipantSlot(
    slotId: string,
    participantSlotId: string,
    updates: Partial<ParticipantSlot>
  ) {
    await fetch(`/api/activities/participants/update-status`, {
      method: "POST",
      body: JSON.stringify({
        slotId,
        participantSlotId,
        ...updates,
      }),
    });

    load(); // refresh
  }

  if (loading) {
    return <div className="text-gray-500">Loading…</div>;
  }

  // =====================================================
  // Helper — Count participants per slot
  // =====================================================
  function countParticipants(slotId: string) {
    return participantData.filter((p) =>
      p.slots.some((s) => s.timeSlotId === slotId)
    ).length;
  }

  const slotCapacity = activity.maxParticipants; // fallback

  return (
    <div className="space-y-6">

      {/* Toggle */}
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

      {/* -------------------------------------
          VIEW A — GROUP BY SLOT
      -------------------------------------- */}
      {viewMode === "slot" && (
      <div className="space-y-10">

        {activity.timeSlots.map((slot: TimeSlot) => {
          const slotParticipants = participantData.filter((p) =>
            p.slots.some((s) => s.timeSlotId === slot.id)
          );

          return (
            <div key={slot.id} className="border rounded-xl bg-gray-50 p-6">

              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {slot.date} — {slot.startTime} → {slot.endTime}
                </h3>
                <p className="text-blue-700 font-semibold">
                  {slotParticipants.length} / {activity.maxParticipants}
                </p>
              </div>

              {/* NO USERS */}
              {slotParticipants.length === 0 && (
                <p className="text-gray-500">No participants yet.</p>
              )}

              {/* TABLE */}
              {slotParticipants.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-200 text-sm text-gray-700">
                        <th className="border p-2 text-left">Username</th>
                        <th className="border p-2 text-left">Meal</th>
                        <th className="border p-2 text-left">Transport</th>
                        <th className="border p-2 text-left">Status</th>
                        <th className="border p-2 text-left">Arrival</th>
                        <th className="border p-2 text-left">Leave</th>
                        <th className="border p-2 text-left">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {slotParticipants.map((p) => {
                        const slotEntry = p.slots.find(
                          (s) => s.timeSlotId === slot.id
                        );
                        if (!slotEntry) return null;

                        const showSave =
                          slotEntry.statusCode &&
                          [3, 4, 5].includes(slotEntry.statusCode); // Sick, Absent, Left Early

                        return (
                          <tr key={slotEntry.id} className="border-t">
                            {/* USERNAME */}
                            <td className="border p-2">{p.user.username}</td>

                            {/* MEAL */}
                            <td className="border p-2">
                              {slotEntry.mealWanted
                                ? "Yes"
                                : slotEntry.mealWanted === false
                                ? `No (${slotEntry.mealReason ?? "—"})`
                                : "—"}
                            </td>

                            {/* TRANSPORT */}
                            <td className="border p-2">
                              {slotEntry.transportWanted
                                ? "Yes"
                                : slotEntry.transportWanted === false
                                ? `No (${slotEntry.transportReason ?? "—"})`
                                : "—"}
                            </td>

                            {/* STATUS */}
                            <td className="border p-2">
                              <select
                                className="p-1 border rounded"
                                value={slotEntry.statusCode ?? ""}
                                onChange={(e) =>
                                  updateParticipantSlot(slot.id, slotEntry.id, {
                                    statusCode: Number(e.target.value),
                                  })
                                }
                              >
                                <option value="">Unset</option>
                                <option value={1}>Registered</option>
                                <option value={2}>Attended</option>
                                <option value={3}>Sick Leave</option>
                                <option value={4}>Absent</option>
                                <option value={5}>Left Early</option>
                              </select>

                              {/* SAVE BUTTON */}
                              {showSave && (
                                <button
                                  onClick={() =>
                                    updateParticipantSlot(slot.id, slotEntry.id, {
                                      statusCode: slotEntry.statusCode,
                                    })
                                  }
                                  className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded"
                                >
                                  Save
                                </button>
                              )}
                            </td>

                            {/* ARRIVAL */}
                            <td className="border p-2">
                              <button
                                onClick={() =>
                                  updateParticipantSlot(slot.id, slotEntry.id, {
                                    arrivalTime: new Date().toISOString(),
                                  })
                                }
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                              >
                                Mark
                              </button>
                              {slotEntry.arrivalTime && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {new Date(slotEntry.arrivalTime).toLocaleString()}
                                </p>
                              )}
                            </td>

                            {/* LEAVE */}
                            <td className="border p-2">
                              <button
                                onClick={() =>
                                  updateParticipantSlot(slot.id, slotEntry.id, {
                                    leaveTime: new Date().toISOString(),
                                  })
                                }
                                className="px-2 py-1 bg-orange-600 text-white text-xs rounded"
                              >
                                Mark
                              </button>
                              {slotEntry.leaveTime && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {new Date(slotEntry.leaveTime).toLocaleString()}
                                </p>
                              )}
                            </td>

                            {/* KICK BUTTON */}
                            <td className="border p-2">
                              <KickButton
                                participantId={p.id}
                                activityId={activity.id}
                                reload={load}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}


      {/* -------------------------------------
          VIEW B — GROUP BY PARTICIPANT
      -------------------------------------- */}
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
                    <div key={slot.id} className="p-4 bg-white rounded-lg border">
                      <p className="font-medium text-gray-800">
                        {slotInfo.date} — {slotInfo.startTime} → {slotInfo.endTime}
                      </p>

                      <div className="text-sm text-gray-600 mt-1 space-y-2">
                        <p>
                          Meal:{" "}
                          {slot.mealWanted
                            ? "Wants meal"
                            : slot.mealWanted === false
                            ? `No (${slot.mealReason ?? "No reason"})`
                            : "—"}
                        </p>

                        <p>
                          Transport:{" "}
                          {slot.transportWanted
                            ? "Wants transport"
                            : slot.transportWanted === false
                            ? `No (${slot.transportReason ?? "No reason"})`
                            : "—"}
                        </p>

                        {/* Status */}
                        <div>
                          <label>Status:</label>
                          <select
                            className="ml-2 border rounded p-1"
                            value={slot.statusCode ?? ""}
                            onChange={(e) =>
                              updateParticipantSlot(slotInfo.id, slot.id, {
                                statusCode: Number(e.target.value),
                              })
                            }
                          >
                            <option value="">Unset</option>
                            <option value={1}>Registered</option>
                            <option value={2}>Attended</option>
                            <option value={3}>Sick Leave</option>
                            <option value={4}>Absent</option>
                            <option value={5}>Left Early</option>
                          </select>
                        </div>

                        {/* Arrival / Leave */}
                        <div className="flex gap-3 mt-1">
                          <button
                            onClick={() =>
                              updateParticipantSlot(slotInfo.id, slot.id, {
                                arrivalTime: new Date().toISOString(),
                              })
                            }
                            className="px-3 py-1 bg-green-600 text-white rounded"
                          >
                            Mark Arrival
                          </button>

                          <button
                            onClick={() =>
                              updateParticipantSlot(slotInfo.id, slot.id, {
                                leaveTime: new Date().toISOString(),
                              })
                            }
                            className="px-3 py-1 bg-orange-600 text-white rounded"
                          >
                            Mark Leave
                          </button>
                        </div>

                        {slot.arrivalTime && (
                          <p>
                            Arrival: {new Date(slot.arrivalTime).toLocaleString()}
                          </p>
                        )}
                        {slot.leaveTime && (
                          <p>
                            Leave: {new Date(slot.leaveTime).toLocaleString()}
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

