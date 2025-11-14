'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PendingRequest {
  id: number;
  user_uuid: string;
  role_id: number;
  request_message: string | null;
  attachment_path: string | null;
  created_at: string;
  user: {
    username: string | null;
    email: string;
  };
  role: {
    name: string;
  };
}

interface PendingResponse {
  entries: PendingRequest[];
  total: number;
  totalPages: number;
}

export default function PendingRequestsTab() {
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'en';

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [data, setData] = useState<PendingRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    const res = await fetch(
      `/api/admin/roles/list-pending?page=${page}&rows=${rowsPerPage}&search=${encodeURIComponent(
        search
      )}`
    );

    if (!res.ok) return;

    const json: PendingResponse = await res.json();
    setData(json.entries);
    setTotal(json.total);
    setTotalPages(json.totalPages);
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    load();
  }, [load]);

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

      {/* Total Count */}
      <p className="text-sm text-gray-600">
        Total Pending: <span className="font-semibold">{total}</span>
      </p>

      {/* List */}
      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">No pending requests.</p>
        ) : (
        data.map((req) => (
            <div
            key={req.id}
            className="border rounded-lg p-4 flex items-center justify-between"
            >
            {/* LEFT SIDE: info */}
            <div className="flex-1">
                <div className="font-medium">
                {req.user.username || req.user.email}
                </div>

                <div className="text-sm text-gray-600">
                Role: {req.role.name}
                </div>

                {req.request_message && (
                <div className="mt-1 text-sm whitespace-pre-line">
                    {req.request_message}
                </div>
                )}

                <div className="text-xs text-gray-400 mt-1">
                Requested: {new Date(req.created_at).toLocaleString()}
                </div>
            </div>

            {/* RIGHT SIDE: button */}
            <Link
                href={`/${locale}/dashboards/admin/roles/request/${req.id}`}
                className="
                ml-4
                px-4 py-2 
                bg-blue-600 text-white
                rounded-lg
                text-sm
                font-medium
                hover:bg-blue-700
                transition
                whitespace-nowrap
                "
            >
                Open Request
            </Link>
            </div>
        ))
        )}


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
          <span>
            / {totalPages}
          </span>
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
