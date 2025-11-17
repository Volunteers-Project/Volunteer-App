"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// =======================================
// TYPES
// =======================================

interface UserRole {
  id: number;
  name: string;
}

interface TimeSlotInput {
  date: string;
  start: string;
  end: string;
}

interface ActivityInput {
  title: string;
  description: string;
  workTypeCode: number | null;

  minParticipants: number;
  maxParticipants: number;

  meetingLocationText: string;
  meetingLat: number | null;
  meetingLng: number | null;

  volunteerLocationText: string;
  volunteerLat: number | null;
  volunteerLng: number | null;

  transportationProvided: boolean;
  transportIsFree: boolean;
  transportFee: number | null;
  transportCurrency: string;

  mealProvided: boolean;
  mealIsFree: boolean;
  mealFee: number | null;
  mealCurrency: string;

  timeSlots: {
    date: string;
    startTime: string;
    endTime: string;
    dayCode: number;
  }[];
}

// Work types
export const WorkTypeMap: Record<number, string> = {
  1: "Cooking",
  2: "Hard Labor",
  3: "Medical Assistance",
  4: "Distribution",
  5: "Logistics",
};

// Helper: weekday converter
function computeDayCode(dateStr: string): number {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0-6
  return day === 0 ? 7 : day;
}

export default function CreateActivityPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const newsId = params.id as string;

  // ROLE CHECK
  const [isOrganizer, setIsOrganizer] = useState<boolean | null>(null);

  // FORM STATE
  const [form, setForm] = useState<ActivityInput>({
    title: "",
    description: "",
    workTypeCode: null,

    minParticipants: 1,
    maxParticipants: 10,

    meetingLocationText: "",
    meetingLat: null,
    meetingLng: null,

    volunteerLocationText: "",
    volunteerLat: null,
    volunteerLng: null,

    transportationProvided: false,
    transportIsFree: true,
    transportFee: null,
    transportCurrency: "TWD",

    mealProvided: false,
    mealIsFree: true,
    mealFee: null,
    mealCurrency: "TWD",

    timeSlots: [],
  });

  const [newSlot, setNewSlot] = useState<TimeSlotInput>({
    date: "",
    start: "",
    end: "",
  });

  // ======================================================
  // 1️⃣ Load Role
  // ======================================================
  useEffect(() => {
    async function checkRole() {
      const res = await fetch(`/api/user-active-roles?user_uuid=me`);
      const roles: UserRole[] = await res.json();
      setIsOrganizer(roles.some((r) => r.name === "organizer"));
    }
    checkRole();
  }, []);

  // ======================================================
  // 2️⃣ Google Maps Autocomplete
  // ======================================================
  useEffect(() => {
    initAutocomplete();
  }, []);

  function initAutocomplete() {
    const w = window as unknown as { google?: unknown };
    if (!("google" in w) || !w.google) return;

    const g = w.google as {
      maps: {
        places: {
          Autocomplete: new (input: HTMLInputElement) => google.maps.places.Autocomplete;
        };
      };
    };

    function setupAutocomplete(
      id: string,
      cb: (text: string, lat: number, lng: number) => void
    ) {
      const input = document.getElementById(id) as HTMLInputElement | null;
      if (!input) return;

      const auto = new g.maps.places.Autocomplete(input);

      auto.addListener("place_changed", () => {
        const place = auto.getPlace();

        // TS SAFE CHECK
        if (!place || !place.geometry || !place.geometry.location) {
          console.warn("Google Maps: Missing geometry");
          return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        cb(place.formatted_address ?? input.value, lat, lng);
      });
    }

    // MEETING
    setupAutocomplete("meeting-location-input", (text, lat, lng) => {
      setForm((f) => ({
        ...f,
        meetingLocationText: text,
        meetingLat: lat,
        meetingLng: lng,
      }));
    });

    // VOLUNTEER
    setupAutocomplete("volunteer-location-input", (text, lat, lng) => {
      setForm((f) => ({
        ...f,
        volunteerLocationText: text,
        volunteerLat: lat,
        volunteerLng: lng,
      }));
    });
  }

  // ======================================================
  // 3️⃣ Organizer access logic
  // ======================================================
  if (isOrganizer === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking permission…
      </div>
    );
  }

  if (!isOrganizer) {
    router.replace(`/${locale}`);
    return null;
  }

  // ======================================================
  // Timeslot Methods
  // ======================================================
  function addTimeslot() {
    if (!newSlot.date || !newSlot.start || !newSlot.end) return;

    const dayCode = computeDayCode(newSlot.date);

    setForm((f) => ({
      ...f,
      timeSlots: [
        ...f.timeSlots,
        {
          date: newSlot.date,
          startTime: newSlot.start,
          endTime: newSlot.end,
          dayCode,
        },
      ],
    }));

    setNewSlot({ date: "", start: "", end: "" });
  }

  function removeSlot(i: number) {
    setForm((f) => ({
      ...f,
      timeSlots: f.timeSlots.filter((_, idx) => idx !== i),
    }));
  }

  // ======================================================
  // SUBMIT
  // ======================================================
  async function handleSubmit() {
    const payload = {
      ...form,
      newsId: Number(newsId),
    };

    const res = await fetch("/api/activities/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Activity created!");
      router.push(`/${locale}/news/${newsId}`);
    } else {
      alert("Error creating activity.");
    }
  }

  // ======================================================
  // UI
  // ======================================================
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Create Volunteer Activity</h1>

      {/* TITLE */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Title</label>
        <input
          className="w-full p-3 border rounded"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      {/* DESCRIPTION */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          className="w-full p-3 border rounded"
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      {/* WORK TYPE */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Work Type</label>
        <select
          className="w-full p-3 border rounded"
          value={form.workTypeCode ?? ""}
          onChange={(e) => setForm({ ...form, workTypeCode: Number(e.target.value) })}
        >
          <option value="">Select Work Type</option>
          {Object.entries(WorkTypeMap).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* PARTICIPANTS */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block mb-1 font-medium">Minimum Participants</label>
          <input
            type="number"
            className="w-full p-3 border rounded"
            value={form.minParticipants}
            onChange={(e) =>
              setForm({ ...form, minParticipants: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Maximum Participants</label>
          <input
            type="number"
            className="w-full p-3 border rounded"
            value={form.maxParticipants}
            onChange={(e) =>
              setForm({ ...form, maxParticipants: Number(e.target.value) })
            }
          />
        </div>
      </div>

      {/* MEETING LOCATION */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Meeting Location</label>
        <input
          id="meeting-location-input"
          className="w-full p-3 border rounded"
          placeholder="Search meeting location…"
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              meetingLocationText: e.target.value,
            }))
          }
        />
        {form.meetingLocationText && (
          <p className="text-sm text-gray-600 mt-1">
            Selected: {form.meetingLocationText}
          </p>
        )}
      </div>

      {/* VOLUNTEER LOCATION */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Volunteer Location</label>
        <input
          id="volunteer-location-input"
          className="w-full p-3 border rounded"
          placeholder="Search volunteer location…"
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              volunteerLocationText: e.target.value,
            }))
          }
        />
        {form.volunteerLocationText && (
          <p className="text-sm text-gray-600 mt-1">
            Selected: {form.volunteerLocationText}
          </p>
        )}
      </div>

      {/* TRANSPORTATION */}
      <div className="mb-8">
        <label className="block mb-2 font-semibold">Transportation</label>

        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={form.transportationProvided}
              onChange={() => setForm({ ...form, transportationProvided: true })}
            />
            Provided
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!form.transportationProvided}
              onChange={() => setForm({ ...form, transportationProvided: false })}
            />
            Not Provided
          </label>
        </div>

        {form.transportationProvided && (
          <div className="pl-4 space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.transportIsFree}
                onChange={() => setForm({ ...form, transportIsFree: true })}
              />
              Free
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!form.transportIsFree}
                onChange={() => setForm({ ...form, transportIsFree: false })}
              />
              Paid
            </label>

            {!form.transportIsFree && (
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  className="p-2 border rounded w-28"
                  placeholder="Fee"
                  value={form.transportFee ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, transportFee: Number(e.target.value) })
                  }
                />
                <select
                  className="p-2 border rounded"
                  value={form.transportCurrency}
                  onChange={(e) =>
                    setForm({ ...form, transportCurrency: e.target.value })
                  }
                >
                  <option value="TWD">TWD</option>
                  <option value="USD">USD</option>
                  <option value="IDR">IDR</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MEAL */}
      <div className="mb-8">
        <label className="block mb-2 font-semibold">Meal</label>

        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={form.mealProvided}
              onChange={() => setForm({ ...form, mealProvided: true })}
            />
            Provided
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!form.mealProvided}
              onChange={() => setForm({ ...form, mealProvided: false })}
            />
            Not Provided
          </label>
        </div>

        {form.mealProvided && (
          <div className="pl-4 space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.mealIsFree}
                onChange={() => setForm({ ...form, mealIsFree: true })}
              />
              Free
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!form.mealIsFree}
                onChange={() => setForm({ ...form, mealIsFree: false })}
              />
              Paid
            </label>

            {!form.mealIsFree && (
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  className="p-2 border rounded w-28"
                  placeholder="Fee"
                  value={form.mealFee ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, mealFee: Number(e.target.value) })
                  }
                />
                <select
                  className="p-2 border rounded"
                  value={form.mealCurrency}
                  onChange={(e) =>
                    setForm({ ...form, mealCurrency: e.target.value })
                  }
                >
                  <option value="TWD">TWD</option>
                  <option value="USD">USD</option>
                  <option value="IDR">IDR</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TIMESLOTS */}
      <div className="mb-10">
        <label className="block mb-2 font-semibold">Timeslots</label>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-sm block mb-1">Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={newSlot.date}
              onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm block mb-1">Start</label>
            <input
              type="time"
              className="w-full p-2 border rounded"
              value={newSlot.start}
              onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm block mb-1">End</label>
            <input
              type="time"
              className="w-full p-2 border rounded"
              value={newSlot.end}
              onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
            />
          </div>

          <button
            onClick={addTimeslot}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Add
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {form.timeSlots.map((slot, idx) => (
            <div
              key={`${slot.date}-${idx}`}
              className="flex justify-between bg-gray-100 p-3 rounded"
            >
              <span>
                {slot.date} — {slot.startTime} to {slot.endTime}
              </span>
              <button className="text-red-500" onClick={() => removeSlot(idx)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Create Activity
      </button>
    </div>
  );
}
