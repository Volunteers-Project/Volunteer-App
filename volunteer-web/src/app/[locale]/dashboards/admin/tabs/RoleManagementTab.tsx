'use client';

import { useCallback, useEffect, useState } from 'react';

interface RoleUserEntry {
  id: number;
  user_uuid: string;
  role_id: number;
  status: number;
  request_message: string | null;
  attachment_path: string | null;
  active_until: string | null;
  downtime_until: string | null;
  rejection_reason: string | null;
  created_at: string;
  user: {
    email: string;
    username: string | null;
  };
  role: {
    name: string;
  };
}

interface ApiResponse {
  total: number;
  data: RoleUserEntry[];
}

export default function RoleManagementTab() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [entries, setEntries] = useState<RoleUserEntry[]>([]);
  const [total, setTotal] = useState(0);

  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const load = useCallback(async () => {
    const res = await fetch(
      `/api/admin/roles/list-pending?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(
        search
      )}`
    );

    if (!res.ok) return;

    const json: ApiResponse = await res.json();

    setEntries(json.data);
    setTotal(json.total);
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const pending = entries.filter((e) => e.status === 1);
  const others = entries.filter((e) => e.status !== 1);

  return (
    <div>
      {/* Search */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search username or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded-lg w-full"
        />
      </div>

      {/* Pending */}
      <h2 className="text-lg font-semibold mb-2">Pending Requests</h2>

      {pending.length === 0 && (
        <p className="text-sm text-gray-500 mb-4">No pending requests.</p>
      )}

      {pending.map((e) => (
        <div key={e.id} className="border rounded-lg p-4 mb-2">
          <div className="font-medium">{e.user.username || e.user.email}</div>
          <div className="text-sm text-gray-600">Role: {e.role.name}</div>
          <div className="text-sm mt-1">{e.request_message}</div>
          <div className="text-xs text-gray-400 mt-1">Requested: {e.created_at}</div>
        </div>
      ))}

      <hr className="my-4" />

      {/* All Others */}
      <h2 className="text-lg font-semibold mb-2">All Role Records</h2>

      {others.map((e) => (
        <div key={e.id} className="border rounded-lg p-4 mb-2">
          <div className="font-medium">{e.user.username || e.user.email}</div>
          <div className="text-sm text-gray-600">
            Role: {e.role.name} — Status Code: {e.status}
          </div>

          {e.active_until && (
            <div className="text-sm">Active Until: {e.active_until}</div>
          )}
          {e.rejection_reason && (
            <div className="text-sm text-red-600">
              Rejected: {e.rejection_reason}
            </div>
          )}
        </div>
      ))}

      {/* Pagination */}
      <div className="flex justify-between mt-6 items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <div className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </div>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
