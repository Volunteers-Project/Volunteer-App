"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

import TabParticipantSignup from "./components/TabParticipantSignup";
import TabOrganizerParticipants from "./components/TabOrganizerParticipants";
import TabOrganizerEdit from "./components/TabOrganizerEdit";
import TabInfo from "./components/TabInfo";


import type { ActivityDetails } from "@/types/activities";
// ======================
// Types
// ======================

// Matches Prisma ActivityTimeSlot
export interface ActivityTimeSlot {
  id: string;
  date: string;
  dayCode: number;
  startTime: string;
  endTime: string;
}

// Matches data from /api/user-active-roles
export interface Role {
  id: number;
  name: string;
}

// Matches /api/auth/me
export interface AuthUser {
  id: string;
  email: string;
  username?: string;
}

export default function ActivityPage() {
  const params = useParams();
  const activityId = params["activities-id"] as string;

  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<ActivityDetails | null>(null);
  const [isOrganizer, setIsOrganizer] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");

  const [activeTab, setActiveTab] = useState<
    "info" | "join" | "participants" | "edit"
  >("info");


  // ==================================================
  // Load Activity + User Info
  // ==================================================
  const load = useCallback(async () => {
    setLoading(true);

    // 🟦 Fetch activity details
    const res = await fetch(`/api/activities/get/${activityId}`);
    const activityJson: ActivityDetails = await res.json();
    setActivity(activityJson);

    // 🟧 Fetch current user
    const userRes = await fetch("/api/auth/me");
    const userJson: AuthUser = await userRes.json();
    setUserId(userJson.id);

    // 🟩 Fetch roles
    const roleRes = await fetch("/api/user-active-roles?user_uuid=me");
    const roles: Role[] = await roleRes.json();
    setIsOrganizer(roles.some((r) => r.name === "organizer"));

    setLoading(false);
  }, [activityId]);

  useEffect(() => {
    load();
  }, [load]);

  // ==================================================
  // RENDER
  // ==================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Activity not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* BACK BUTTON */}
      <button
        onClick={() => {
          const locale = params.locale as string;
          const newsId = params.id as string;
          window.location.href = `/${locale}/news/${newsId}`;
        }}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to News
      </button>


      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {activity.title}
      </h1>

      {/* Date */}
      <p className="text-gray-500 mb-6">
        Created: {new Date(activity.createdAt).toLocaleString()}
      </p>

      {/* TABS */}
      <div className="flex border-b mb-6">

        <button
          onClick={() => setActiveTab("info")}
          className={`px-4 py-2 -mb-px border-b-2 ${
            activeTab === "info"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500"
          }`}
        >
          Activity Info
        </button>

        <button
          onClick={() => setActiveTab("join")}
          className={`px-4 py-2 -mb-px border-b-2 ${
            activeTab === "join"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500"
          }`}
        >
          Join Activity
        </button>

        {isOrganizer && (
          <button
            onClick={() => setActiveTab("participants")}
            className={`px-4 py-2 -mb-px border-b-2 ${
              activeTab === "participants"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-500"
            }`}
          >
            Participants
          </button>
        )}

        {/* {isOrganizer && (
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-4 py-2 -mb-px border-b-2 ${
              activeTab === "edit"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-500"
            }`}
          >
            Edit Activity
          </button>
        )} */}
      </div>

      {/* TAB CONTENT */}
      {activeTab === "info" && <TabInfo activity={activity} />}

      {activeTab === "join" && (
        <TabParticipantSignup activity={activity} userId={userId} />
      )}

      {activeTab === "participants" && isOrganizer && (
        <TabOrganizerParticipants activity={activity} />
      )}

      {activeTab === "edit" && isOrganizer && (
        <TabOrganizerEdit activity={activity} />
      )}
    </div>
  );
}
