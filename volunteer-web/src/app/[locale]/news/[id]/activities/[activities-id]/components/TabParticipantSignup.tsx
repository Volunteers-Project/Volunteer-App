"use client";

import { useEffect, useState } from "react";
import { ActivityDetails } from "@/types/activities";

interface Props {
  activity: ActivityDetails;
  userId: string;
}

interface SignupState {
  slotId: string;
  selected: boolean;

  mealWanted: boolean | null;
  mealReason: string;

  transportWanted: boolean | null;
  transportReason: string;
}

interface JoinedSlot {
  slotId: string;
  mealWanted: boolean | null;
  mealReason: string | null;
  transportWanted: boolean | null;
  transportReason: string | null;
  selected: boolean;
}

export default function TabParticipantSignup({ activity, userId }: Props) {
  const [signupMap, setSignupMap] = useState<SignupState[]>([]);
  const [joinedSlots, setJoinedSlots] = useState<JoinedSlot[]>([]);
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // ==================================================
  // LOAD JOINED + COUNTS + INITIAL STATE
  // ==================================================
  useEffect(() => {
    async function loadState() {
      const res = await fetch(`/api/activities/participants/check/${activity.id}`);
      const data = await res.json();

      const joined = data.joinedSlotDetails ?? [];
      setJoinedSlots(
        joined.map((s: JoinedSlot) => ({
          slotId: s.slotId,
          mealWanted: s.mealWanted,
          mealReason: s.mealReason,
          transportWanted: s.transportWanted,
          transportReason: s.transportReason,
          selected: false,
        }))
      );

      setSlotCounts(data.slotCounts || {});

      // new slots default
      setSignupMap(
        activity.timeSlots.map((slot) => ({
          slotId: slot.id,
          selected: false,
          mealWanted: activity.meal?.provided ? null : null,
          mealReason: "",
          transportWanted: activity.transport?.provided ? null : null,
          transportReason: "",
        }))
      );

      setLoading(false);
    }

    loadState();
  }, [activity]);

  if (loading) return <div className="text-gray-500">Loading…</div>;

  // ==================================================
  // UPDATE HELPERS
  // ==================================================
  function updateNew(slotId: string, updates: Partial<SignupState>) {
    setSignupMap((prev) =>
      prev.map((s) => (s.slotId === slotId ? { ...s, ...updates } : s))
    );
  }

  function updateJoined(slotId: string, updates: Partial<JoinedSlot>) {
    setJoinedSlots((prev) =>
      prev.map((s) => (s.slotId === slotId ? { ...s, ...updates } : s))
    );
  }

  // ==================================================
  // CANCEL LOGIC
  // ==================================================
  async function handleCancel() {
    const selectedCancels = joinedSlots.filter((s) => s.selected);

    if (selectedCancels.length === 0) {
      alert("Select at least one slot to cancel.");
      return;
    }

    const payload = {
      activityId: activity.id,
      slotIds: selectedCancels.map((s) => s.slotId),
    };

    const res = await fetch("/api/activities/participants/cancel", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.ok) location.reload();
    else alert("Failed to cancel registration.");
  }

  // ==================================================
  // REGISTRATION LOGIC
  // ==================================================
  const totalFee = signupMap.reduce((sum, s) => {
    if (!s.selected) return sum;

    if (activity.meal?.provided && activity.meal.isPaid && s.mealWanted)
      sum += activity.meal.fee ?? 0;

    if (activity.transport?.provided && activity.transport.isPaid && s.transportWanted)
      sum += activity.transport.fee ?? 0;

    return sum;
  }, 0);

  const currency =
    activity.meal?.currency ||
    activity.transport?.currency ||
    "NTD";

  async function handleRegister() {
    const chosen = signupMap.filter((s) => s.selected);

    if (chosen.length === 0) {
      alert("Select at least one time slot.");
      return;
    }

    const payload = {
      activityId: activity.id,
      slots: chosen.map((s) => ({
        slotId: s.slotId,
        mealWanted: activity.meal?.provided ? s.mealWanted : null,
        mealReason: activity.meal?.provided ? s.mealReason : null,
        transportWanted: activity.transport?.provided ? s.transportWanted : null,
        transportReason: activity.transport?.provided ? s.transportReason : null,
      })),
    };

    const res = await fetch("/api/activities/participants/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.ok) location.reload();
    else alert("Registration failed.");
  }

  // ==================================================
  // UI
  // ==================================================
  return (
    <div className="space-y-10">

      {/* JOINED SLOTS =================================== */}
      {joinedSlots.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-blue-700">
            Your Registered Time Slots
          </h2>

          {joinedSlots.map((slot) => {
            const info = activity.timeSlots.find((t) => t.id === slot.slotId);
            if (!info) return null;

            return (
              <div
                key={slot.slotId}
                className="p-4 border rounded-xl bg-blue-50 flex justify-between"
              >
                <div>
                  <p className="font-medium text-blue-900">
                    {info.date} — {info.startTime} → {info.endTime}
                  </p>
                  <p className="text-sm text-blue-700">
                    Meal: {slot.mealWanted === null ? "—" : slot.mealWanted ? "Yes" : "No"}<br/>
                    Transport: {slot.transportWanted === null ? "—" : slot.transportWanted ? "Yes" : "No"}
                  </p>
                </div>

                <label className="flex items-center gap-2 text-blue-700">
                  <input
                    type="checkbox"
                    checked={slot.selected}
                    onChange={(e) =>
                      updateJoined(slot.slotId, { selected: e.target.checked })
                    }
                  />
                  Cancel
                </label>
              </div>
            );
          })}

          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Cancel Selected Slots
          </button>
        </section>
      )}

      {/* AVAILABLE SLOTS =================================== */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Available Time Slots
        </h2>

        {activity.timeSlots.map((slot) => {
          // Skip if already joined
          if (joinedSlots.some((j) => j.slotId === slot.id)) return null;

          const state = signupMap.find((s) => s.slotId === slot.id);
          if (!state) return null;

          const count = slotCounts[slot.id] || 0;
          const max = activity.maxParticipants;

          const isFull = count >= max;

          return (
            <div
              key={slot.id}
              className="p-6 border rounded-xl bg-white shadow-sm space-y-5"
            >
              {/* SLOT HEADER */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={isFull}
                    checked={state.selected}
                    onChange={(e) =>
                      updateNew(slot.id, { selected: e.target.checked })
                    }
                    className="w-5 h-5"
                  />

                  <div>
                    <p className="font-medium text-gray-900">
                      {slot.date} — {slot.startTime} → {slot.endTime}
                    </p>
                    <p className="text-sm text-gray-600">
                      {count} / {max} participants
                    </p>
                  </div>
                </label>

                {isFull && (
                  <span className="px-3 py-1 text-xs bg-red-500 text-white rounded">
                    FULL
                  </span>
                )}
              </div>

              {/* Expanded form */}
              {state.selected && !isFull && (
                <div className="pl-6 space-y-6">

                  {/* MEAL */}
                  {activity.meal?.provided && (
                    <div>
                      <p className="font-medium">Meal</p>
                      {/* Options */}
                      <div className="flex gap-6 mt-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={state.mealWanted === true}
                            onChange={() =>
                              updateNew(slot.id, { mealWanted: true })
                            }
                          />
                          Want meal
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={state.mealWanted === false}
                            onChange={() =>
                              updateNew(slot.id, { mealWanted: false })
                            }
                          />
                          Do NOT want
                        </label>
                      </div>

                      {state.mealWanted === false && (
                        <textarea
                          className="mt-2 w-full p-3 border rounded-lg"
                          placeholder="Reason for declining meal"
                          value={state.mealReason}
                          onChange={(e) =>
                            updateNew(slot.id, { mealReason: e.target.value })
                          }
                        />
                      )}
                    </div>
                  )}

                  {/* TRANSPORT */}
                  {activity.transport?.provided && (
                    <div>
                      <p className="font-medium">Transportation</p>

                      <div className="flex gap-6 mt-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={state.transportWanted === true}
                            onChange={() =>
                              updateNew(slot.id, { transportWanted: true })
                            }
                          />
                          Need transport
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={state.transportWanted === false}
                            onChange={() =>
                              updateNew(slot.id, { transportWanted: false })
                            }
                          />
                          Do NOT need
                        </label>
                      </div>

                      {state.transportWanted === false && (
                        <textarea
                          className="mt-2 w-full p-3 border rounded-lg"
                          placeholder="Reason for declining transport"
                          value={state.transportReason}
                          onChange={(e) =>
                            updateNew(slot.id, {
                              transportReason: e.target.value,
                            })
                          }
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* TOTAL FEE */}
      <div className="text-xl font-semibold text-right">
        Total:{" "}
        <span className="text-blue-700">
          {totalFee} {currency}
        </span>
      </div>

      {/* SUBMIT */}
      <button
        onClick={handleRegister}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
      >
        Register
      </button>
    </div>
  );
}
