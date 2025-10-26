'use client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import BasicInformationForm from './sections/BasicInformationForm';
import ContactInformationForm from './sections/ContactInformationForm';
import OtherPreferencesForm from './sections/OtherPreferencesForm';
import { VolunteerProfile } from './types';

interface Props {
  user: User;
}

export default function FullProfileTab({ user }: Props) {
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load profile
  useEffect(() => {
    async function loadProfile() {
      const res = await fetch(`/api/user/${user.id}/profile`);
      if (res.ok) setProfile(await res.json());
      setLoading(false);
    }
    loadProfile();
  }, [user.id]);

  const handleChange = (
    field: keyof VolunteerProfile,
    value: string | number | boolean | string[] | Record<string, unknown> | null
  ) => {
    setProfile((prev) => (prev ? { ...prev, [field]: value } : { [field]: value }));
  };


  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await fetch(`/api/user/${user.id}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    setSaving(false);
    alert('Profile saved!');
  };

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>No profile data found.</p>;

  return (
    <div className="space-y-8">
      <BasicInformationForm profile={profile} onChange={handleChange} />
      <ContactInformationForm profile={profile} onChange={handleChange} />
      <OtherPreferencesForm profile={profile} onChange={handleChange} />

      <div className="w-2/3 mx-auto mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-2 rounded-full text-sm transition text-white ${
            saving
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-black hover:bg-gray-800'
          }`}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
