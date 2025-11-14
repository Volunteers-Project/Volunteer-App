'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface UserEntry {
  userId: string;
  username: string | null;
  email: string;
  createdAt: string;
  roleCount: number;
  hasPending: boolean;
  roles: {
    id: number;
    role_id: number;
    status: number;
    role_name: string;
    request_message: string | null;
    attachment_path: string | null;
    active_until: string | null;
    downtime_until: string | null;
    rejection_reason: string | null;
    created_at: string;
  }[];
}

interface UsersResponse {
  entries: UserEntry[];
  total: number;
  totalPages: number;
}

export default function AllUsersTab() {
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'en';

  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(1);

  const [data, setData] = useState<UserEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    const res = await fetch(
      `/api/admin/roles/list-users?page=${page}&rows=${rowsPerPage}&search=${encodeURIComponent(
        search
      )}`
    );
    if (!res.ok) return;

    const json: UsersResponse = await res.json();
    setData(json.entries);
    setTotal(json.total);
    setTotalPages(json.totalPages);
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search username or email..."
          className="px-4 py-2 border rounded-lg w-full"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(1);
          }}
          className="px-3 py-2 border rounded-lg"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}/page
            </option>
          ))}
        </select>
      </div>

      {/* Total */}
      <p className="text-sm text-gray-600">
        Total Users with Roles: <span className="font-semibold">{total}</span>
      </p>

      {/* Accordion List */}
      {data.length === 0 && (
        <p className="text-sm text-gray-500">No users found.</p>
      )}

      {data.map((u) => (
        <div
            key={u.userId}
            className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition"
            onClick={() => toggle(u.userId)}
        >
            {/* Header Row (now clickable) */}
            <div className="flex justify-between items-center">
            <div>
                <div className="font-medium">
                {u.username || u.email}
                </div>
                <div className="text-sm text-gray-600">
                {u.email}
                </div>
                <div className="text-xs text-gray-500">
                Created: {u.createdAt}
                </div>
                <div className="text-xs text-blue-600 font-medium">
                Roles: {u.roleCount} {u.hasPending && ' • Pending Request'}
                </div>
            </div>

            <span className="text-blue-600 text-sm">
                {expanded[u.userId] ? '▲' : '▼'}
            </span>
            </div>

            {/* Expanded Section */}
            {expanded[u.userId] && (
            <div className="mt-4 border-t pt-4 space-y-4">
                {u.roles.map((r) => {

                function getStatusLabel(status: number): string {
                    switch (status) {
                    case 0: return "Inactive";
                    case 1: return "Pending Approval";
                    case 2: return "Approved";
                    case 3: return "Rejected";
                    default: return "Unknown";
                    }
                }

                return (
                    <div
                    key={r.id}
                    className="border rounded-lg p-4 bg-gray-50"
                    onClick={(e) => e.stopPropagation()}
                    >
                    <div className="font-semibold text-gray-800">
                        {r.role_name}
                    </div>

                    <div className="text-sm text-gray-600">
                        Status: <span className="font-medium">{getStatusLabel(r.status)}</span>
                    </div>

                    {r.request_message && (
                        <div className="text-sm mt-1">Message: {r.request_message}</div>
                    )}

                    {r.attachment_path && (
                        <a
                        href={r.attachment_path}
                        target="_blank"
                        className="text-blue-600 hover:underline text-sm block mt-1"
                        onClick={(e) => e.stopPropagation()}
                        >
                        View Attachment
                        </a>
                    )}

                    {r.active_until && (
                        <div className="text-sm">Active Until: {r.active_until}</div>
                    )}

                    {r.downtime_until && (
                        <div className="text-sm text-gray-600">
                        Cooldown Until: {r.downtime_until}
                        </div>
                    )}

                    {r.rejection_reason && (
                        <div className="text-sm text-red-600">
                        Rejection Reason: {r.rejection_reason}
                        </div>
                    )}

                    {r.status === 1 && (
                        <div className="mt-3 flex justify-end">
                            <button
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/${locale}/dashboards/admin/roles/request/${r.id}`;
                                }}
                            >
                                Open Pending Request
                            </button>
                        </div>
                    )}
                    </div>
                );
                })}
            </div>
            )}

        </div>
        ))}


      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={page}
            onChange={(e) => setPage(Number(e.target.value))}
            className="w-16 px-2 py-1 border rounded"
          />
          <span>/ {totalPages}</span>
        </div>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
