"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface NewsDetails {
  id: string;
  title: string;
  fileUrl: string;
  thumbnail: string;
  tags: string[];
  createdAt: string;
}

interface ActivityDetails {
  id: string;
  title: string;
  description: string;
  minParticipants: number;
  maxParticipants: number;

  createdAt: string;

  meetingLocation: string;
  volunteerLocation: string;

  timeSlots: {
    id: string;
    dayCode: number;
    date: string;
    startTime: string;
    endTime: string;
  }[];

  participants: { id: string }[];
}

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();

  const locale = params.locale as string;
  const newsId = params.id as string;

  const [news, setNews] = useState<NewsDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);

  const [activities, setActivities] = useState<ActivityDetails[]>([]);
  const [activeTab, setActiveTab] = useState<"news" | "activity">("news");

  const [isOrganizer, setIsOrganizer] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      // Load news metadata
      const res = await fetch(`/api/news/${newsId}`);
      const json = await res.json();
      setNews(json);

      interface UserRole {
        id: number;
        name: string;
      }

      // Load role
      const roleRes = await fetch(`/api/user-active-roles?user_uuid=me`);
      const roles = await roleRes.json();
      setIsOrganizer(roles.some((r: UserRole) => r.name === "organizer"));

      // Load related activities
      const actRes = await fetch(`/api/activities/by-news/${newsId}`);
      const actJson = await actRes.json();
      setActivities(Array.isArray(actJson) ? actJson : []);

      // Convert DOCX → HTML
      const blob = await fetch(json.fileUrl).then((r) => r.blob());
      const doc = new File(
        [blob],
        "document.docx",
        {
          type:
            blob.type ||
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }
      );

      const fd = new FormData();
      fd.append("file", doc);

      const conv = await fetch("/api/convert/docx", {
        method: "POST",
        body: fd,
      });

      const result = await conv.json();
      setDocxHtml(result.html);

      setLoading(false);
    }

    load();
  }, [newsId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading…
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        News not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Back Button */}
      <button
        onClick={() => router.push(`/${locale}`)}
        className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium transition"
      >
        ← Back
      </button>

      {/* Thumbnail */}
      {news.thumbnail && (
        <img
          src={news.thumbnail}
          alt="thumbnail"
          className="w-full rounded-xl shadow mb-8"
        />
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {news.title}
      </h1>

      <p className="text-gray-500 mb-6">
        {new Date(news.createdAt).toLocaleDateString()}
      </p>

      {/* Tags */}
      {news.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8">
          {news.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm border border-blue-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* TABS */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("news")}
          className={`px-4 py-2 -mb-px border-b-2 ${
            activeTab === "news"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500"
          }`}
        >
          News
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-2 -mb-px border-b-2 ${
            activeTab === "activity"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500"
          }`}
        >
          Activity
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "news" && (
        <div className="prose max-w-none bg-white p-6 rounded-xl shadow mb-10">
          {docxHtml ? (
            <div dangerouslySetInnerHTML={{ __html: docxHtml }} />
          ) : (
            <p className="text-gray-500">Loading document...</p>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-white p-6 rounded-xl shadow mb-10">

          {/* Create Activity Button */}
          {isOrganizer && (
            <button
              onClick={() =>
                router.push(`/${locale}/news/${newsId}/create`)
              }
              className="mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              + Create Volunteer Activity
            </button>
          )}

          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Activities Related to This News
          </h3>

          {/* ACTIVITIES LIST */}
          {activities.length === 0 ? (
            <p className="text-gray-500">No activities yet.</p>
          ) : (
            <div className="space-y-4">
              {activities.map((a) => (
                <div
                  key={a.id}
                  className="p-4 border rounded-xl shadow-sm bg-gray-50 hover:bg-gray-100 transition"
                >
                  <h4 className="text-lg font-semibold text-gray-800">
                    {a.title}
                  </h4>

                  <p className="text-gray-600 text-sm">{a.description}</p>

                  <p className="text-gray-600 mt-2 text-sm">
                    📍 Meeting: {a.meetingLocation}
                  </p>
                  <p className="text-gray-600 text-sm">
                    🎯 Volunteer Site: {a.volunteerLocation}
                  </p>

                  <p className="text-gray-600 mt-2 text-sm">
                    👥 Participants:{" "}
                    {a.participants.length}/{a.maxParticipants}
                  </p>

                  <div className="mt-2 text-gray-700 text-sm">
                    <strong>Time Slots:</strong>
                    <ul className="list-disc ml-6">
                      {a.timeSlots.map((t) => (
                        <li key={t.id}>
                          {t.date} → {t.startTime}–{t.endTime}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    onClick={() =>
                      router.push(`/${locale}/news/${newsId}/activities/${a.id}`)
                    }
                  >
                    View Activity
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
