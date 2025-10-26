'use client';
import { useState } from 'react';
import { VolunteerProfile, ScaleMap, DayMap, WorkTypeMap,VolunteerSchedule, VolunteerLocation } from '../types';


type ChangeValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | Record<string, unknown>
  | VolunteerSchedule[]
  | VolunteerLocation[]
  | null;

interface Props {
  profile: VolunteerProfile;
  onChange: (field: keyof VolunteerProfile, value: ChangeValue) => void;
}



interface TimeSlot {
  day: string;
  start: string;
  end: string;
}

interface Location {
  region: string;
  area: string;
}

export default function OtherPreferencesForm({ profile, onChange }: Props) {
  const [newTime, setNewTime] = useState<TimeSlot>({
    day: '',
    start: '',
    end: '',
  });

  const [newLocation, setNewLocation] = useState<Location>({
    region: '',
    area: '',
  });


  const addLocation = () => {
    if (!newLocation.region || !newLocation.area) return;
    const current = profile.locations || [];
    const updated = [...current, newLocation];
    onChange('locations', updated);
    setNewLocation({ region: '', area: '' });
  };

  const removeLocation = (index: number) => {
    const updated = [...(profile.locations || [])];
    updated.splice(index, 1);
    onChange('locations', updated);
  };

  return (
    <section className="space-y-6">
      <h4 className="text-md font-semibold mb-2">Preferences</h4>

      {/* ========================= Volunteer Scale ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Volunteer Scale</label>
          <select
            value={profile.volunteerScaleCode ?? ''}
            onChange={(e) => onChange('volunteerScaleCode', parseInt(e.target.value))}
            className="w-full p-3 rounded-full border focus:outline-none transition-all duration-300 
                       focus:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          >
            <option value="">Select Scale</option>
            {Object.entries(ScaleMap).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* ========================= Preferred Volunteer Work ========================= */}
      <div className="space-y-4 mt-6">
        <h5 className="font-semibold text-gray-800">Preferred Volunteer Work</h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(WorkTypeMap).map(([code, label]) => (
            <label key={code} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.preferredWorks?.includes(Number(code)) || false}
                onChange={(e) => {
                  const current = new Set(profile.preferredWorks || []);
                  e.target.checked
                    ? current.add(Number(code))
                    : current.delete(Number(code));
                  onChange('preferredWorks', Array.from(current));
                }}
                className="w-5 h-5 accent-black rounded"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>



      {/* ========================= Preferred Schedule ========================= */}
      <div className="space-y-4 mt-6">
        <h5 className="font-semibold text-gray-800">Preferred Schedule</h5>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm mb-1">Day</label>
            <select
              value={newTime.day}
              onChange={(e) => setNewTime({ ...newTime, day: e.target.value })}
              className="w-full p-3 rounded-full border focus:outline-none transition-all duration-300 focus:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            >
              <option value="">Select Day</option>
              {Object.entries(DayMap).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Start</label>
            <input
              type="time"
              value={newTime.start}
              onChange={(e) => setNewTime({ ...newTime, start: e.target.value })}
              className="w-full p-3 rounded-full border focus:outline-none transition-all duration-300 focus:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">End</label>
            <input
              type="time"
              value={newTime.end}
              onChange={(e) => setNewTime({ ...newTime, end: e.target.value })}
              className="w-full p-3 rounded-full border focus:outline-none transition-all duration-300 focus:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (!newTime.day || !newTime.start || !newTime.end) return;
              const updated = [
                ...(profile.schedules || []),
                {
                  dayCode: parseInt(newTime.day),
                  startTime: newTime.start,
                  endTime: newTime.end,
                },
              ];
              onChange('schedules', updated);
              setNewTime({ day: '', start: '', end: '' });
            }}
            className="bg-black text-white rounded-full py-2 px-4 hover:bg-gray-800 transition"
          >
            Add
          </button>
        </div>

        {/* Display added schedules */}
        <div className="flex flex-wrap gap-2 mt-2">
          {(profile.schedules || []).map((s, idx) => (
            <div
              key={idx}
              className="px-3 py-1 bg-gray-200 rounded-full flex items-center gap-2 text-sm"
            >
              {DayMap[s.dayCode]}: {s.startTime} - {s.endTime}
              <button
                onClick={() => {
                  const updated = [...(profile.schedules || [])];
                  updated.splice(idx, 1);
                  onChange('schedules', updated);
                }}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>



      {/* ========================= Preferred Locations ========================= */}
      <div className="space-y-4 mt-6">
        <h5 className="font-semibold text-gray-800">Preferred Locations</h5>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm mb-1">Country / Region</label>
            <input
              type="text"
              value={newLocation.region}
              onChange={(e) => setNewLocation({ ...newLocation, region: e.target.value })}
              placeholder="e.g., Taiwan"
              className="w-full p-3 rounded-full border focus:outline-none transition-all duration-300 focus:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Area / City</label>
            <input
              type="text"
              value={newLocation.area}
              onChange={(e) => setNewLocation({ ...newLocation, area: e.target.value })}
              placeholder="e.g., Hualien County"
              className="w-full p-3 rounded-full border focus:outline-none transition-all duration-300 focus:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            />
          </div>

          <button
            type="button"
            onClick={addLocation}
            className="bg-black text-white rounded-full py-2 px-4 hover:bg-gray-800 transition"
          >
            Add
          </button>
        </div>

        {/* Display added locations */}
        <div className="flex flex-wrap gap-2 mt-2">
          {(profile.locations || []).map((loc, idx) => (
            <div
              key={`${loc.region}-${loc.area}-${idx}`}
              className="px-3 py-1 bg-gray-200 rounded-full flex items-center gap-2 text-sm"
            >
              {loc.region} — {loc.area}
              <button
                onClick={() => removeLocation(idx)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ========================= Settings ========================= */}
      <div className="space-y-4 mt-6">
        <h5 className="font-semibold text-gray-800">Privacy & Notifications</h5>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Keep Profile Private */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!profile.profilePrivate}
              onChange={(e) => onChange('profilePrivate', e.target.checked)}
              className="w-5 h-5 accent-black rounded"
            />
            <span className="text-sm text-gray-700">
              Keep my profile private
              <span className="block text-xs text-gray-500">
                Only activity organizers you join can view your profile within the event timeframe.
              </span>
            </span>
          </label>


          {/* Receive Notifications */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!profile.receiveNotifications}
              onChange={(e) => onChange('receiveNotifications', e.target.checked)}
              className="w-5 h-5 accent-black rounded"
            />
            <span className="text-sm text-gray-700">
              Receive notifications about volunteer activities within my preferences
            </span>
          </label>
        </div>
      </div>

    </section>
    
  );
}
