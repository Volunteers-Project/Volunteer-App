"use client";

import { useState } from "react";

export default function KickButton({
  participantId,
  activityId,
  reload,
}: {
  participantId: string;
  activityId: string;
  reload: () => void;
}) {
  const [show, setShow] = useState(false);
  const [reason, setReason] = useState("");

  async function handleKick() {
    if (!reason.trim()) {
      alert("Kick reason is required.");
      return;
    }

    await fetch(`/api/activities/participants/kick`, {
      method: "POST",
      body: JSON.stringify({ participantId, activityId, reason }),
    });

    setShow(false);
    reload();
  }

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="px-2 py-1 bg-red-600 text-white text-xs rounded"
      >
        Kick
      </button>

      {show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80 space-y-4">
            <h3 className="text-lg font-semibold text-red-600">
              Remove Participant
            </h3>
            <textarea
              className="w-full border rounded p-2"
              placeholder="Reason for removal"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShow(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleKick}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
