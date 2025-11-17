"use client";

import { ActivityDetails } from "@/types/activities";

export default function TabOrganizerEdit({
  activity,
}: {
  activity: ActivityDetails;
}) {
  return (
    <div className="p-4 border rounded-xl bg-gray-50">
      <p className="text-gray-600">Organizer edit panel (coming soon)</p>

      <pre className="mt-3 text-xs bg-white p-3 rounded border">
        {JSON.stringify(activity, null, 2)}
      </pre>
    </div>
  );
}

