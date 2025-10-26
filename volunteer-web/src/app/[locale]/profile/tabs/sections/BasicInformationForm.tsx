'use client';
import { VolunteerProfile, GenderMap, StatusMap } from '../types';

interface Props {
  profile: VolunteerProfile;
  onChange: (field: keyof VolunteerProfile, value: number | string) => void;
}

export default function BasicInformationForm({ profile, onChange }: Props) {
  return (
    <section className="space-y-6">
      <h4 className="text-md font-semibold mb-2">Basic Information</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={profile.name ?? ''}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full p-3 rounded-full border focus:outline-none transition-all duration-300 
                       focus:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select
            value={profile.genderCode ?? ''}
            onChange={(e) => onChange('genderCode', parseInt(e.target.value))}
            className="w-full p-3 rounded-full border focus:outline-none transition-all duration-300 
                       focus:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          >
            <option value="">Select Gender</option>
            {Object.entries(GenderMap).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <input
            type="date"
            value={profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : ''}
            onChange={(e) => onChange('dateOfBirth', e.target.value)}
            className="w-full p-3 rounded-full border focus:outline-none transition-all duration-300 
                       focus:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={profile.statusCode ?? 1}
            onChange={(e) => onChange('statusCode', parseInt(e.target.value))}
            className="w-full p-3 rounded-full border focus:outline-none transition-all duration-300 
                       focus:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          >
            {Object.entries(StatusMap).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
