'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { User } from '@supabase/supabase-js';

// Lazy load each tab for performance
const FullProfileTab = dynamic(() => import('../tabs/FullProfileTab'));
const VolunteerHistoryTab = dynamic(() => import('../tabs/VolunteerHistoryTab'));
const StoredContactsTab = dynamic(() => import('../tabs/StoredContactsTab'));

type TabKey = 'profile' | 'history' | 'contacts';

export default function ProfileTabs({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex justify-center gap-6 border-b pb-2 mb-4">
        {[
          { key: 'profile', label: 'Full Profile' },
          { key: 'history', label: 'Volunteer History' },
          { key: 'contacts', label: 'Stored Contacts' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={`pb-2 text-sm font-medium ${
              activeTab === tab.key
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render selected tab */}
      {activeTab === 'profile' && <FullProfileTab user={user} />}
      {activeTab === 'history' && <VolunteerHistoryTab user={user} />}
      {activeTab === 'contacts' && <StoredContactsTab user={user} />}
    </div>
  );
}
