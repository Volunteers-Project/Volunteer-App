'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for the 2 main tabs
const PendingRequestsTab = dynamic(
  () => import('./tabs/PendingRequestsTab')
);
const AllUsersTab = dynamic(
  () => import('./tabs/AllUsersTab')
);

type AdminTabKey = 'pending' | 'users';

export default function AdminTabs() {
  const [active, setActive] = useState<AdminTabKey>('pending');

  return (
    <div className="bg-white rounded-xl shadow-md border p-6">
      {/* Tab Buttons */}
      <div className="flex gap-6 border-b pb-2 mb-4">
        <button
          onClick={() => setActive('pending')}
          className={`pb-2 text-sm font-medium ${
            active === 'pending'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Requests
        </button>

        <button
          onClick={() => setActive('users')}
          className={`pb-2 text-sm font-medium ${
            active === 'users'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Users
        </button>
      </div>

      {/* Render Selected Tab */}
      {active === 'pending' && <PendingRequestsTab />}
      {active === 'users' && <AllUsersTab />}
    </div>
  );
}
