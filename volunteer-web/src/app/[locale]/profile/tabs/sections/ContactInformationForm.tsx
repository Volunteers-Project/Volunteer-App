'use client';
import { VolunteerProfile } from '../types';

interface Props {
  profile: VolunteerProfile;
  onChange: (field: keyof VolunteerProfile, value: string) => void;
}

export default function ContactInformationForm({ profile, onChange }: Props) {
  const fields = [
    { label: 'Phone Number', field: 'phone' },
    { label: 'Work Phone', field: 'workPhone' },
    { label: 'Line ID', field: 'lineId' },
    { label: 'WhatsApp Number', field: 'whatsapp' },
    { label: 'WeChat', field: 'wechat' },
  ];

  return (
    <section className="space-y-6">
      <h4 className="text-md font-semibold mb-2">Contact Information</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(({ label, field }) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              type="text"
              value={(profile as any)[field] ?? ''}
              onChange={(e) => onChange(field as keyof VolunteerProfile, e.target.value)}
              className="w-full p-3 rounded-full border focus:outline-none transition-all duration-300 
                         focus:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
