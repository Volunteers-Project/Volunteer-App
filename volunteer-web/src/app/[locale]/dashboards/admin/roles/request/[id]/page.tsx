'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface RoleRequestData {
  id: number;
  user_uuid: string;
  role_name: string;
  status: number;
  request_message: string | null;
  attachment_path: string | null;
  created_at: string;

  active_until: string | null;
  downtime_until: string | null;
  rejection_reason: string | null;

  user: {
    email: string;
    username: string | null;
    volunteerProfile?: {
      name?: string | null;
      phone?: string | null;
      lineId?: string | null;
      whatsapp?: string | null;
      profilePrivate: boolean;
    }
  }
}

export default function RequestDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const locale = pathname?.split('/')[1] || 'en';
  const requestId = Number(params.id);

  const [data, setData] = useState<RoleRequestData | null>(null);
  const [loading, setLoading] = useState(true);

  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [activeUntil, setActiveUntil] = useState('');
  const [downtimeUntil, setDowntimeUntil] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/roles/request-detail?id=${requestId}`);
      if (!res.ok) return;
      const json = await res.json();
      setData(json);
      setLoading(false);
    }
    load();
  }, [requestId]);

  async function submitDecision() {
    if (!decision) return alert('Select approve or reject first.');

    const res = await fetch('/api/admin/roles/submit-decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: requestId,
        decision,
        active_until: activeUntil,
        downtime_until: downtimeUntil,
        rejection_reason: rejectReason,
      }),
    });

    if (res.ok) {
      alert('Decision saved and email sent!');
      router.push(`/${locale}/dashboards/admin`);
    } else {
      alert('Failed to save decision.');
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Not found.</p>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-semibold">Role Request Review</h1>

      {/* Basic info */}
      <div className="border rounded-lg p-4">
        <div className="text-lg font-medium">{data.role_name}</div>
        <div className="text-sm text-gray-600">Requested on {data.created_at}</div>

        <div className="mt-2">
          <strong>User:</strong> {data.user.username || data.user.email}
        </div>

        <div className="text-sm text-gray-700">{data.user.email}</div>
      </div>

      {/* Profile (public only) */}
      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-2">User Profile</h2>

        {data.user.volunteerProfile?.profilePrivate ? (
          <p className="text-gray-500 italic">This profile is private.</p>
        ) : (
          <>
            <p><strong>Name:</strong> {data.user.volunteerProfile?.name || '—'}</p>
            <p><strong>Phone:</strong> {data.user.volunteerProfile?.phone || '—'}</p>
            <p><strong>Line:</strong> {data.user.volunteerProfile?.lineId || '—'}</p>
            <p><strong>WhatsApp:</strong> {data.user.volunteerProfile?.whatsapp || '—'}</p>
          </>
        )}
      </div>

      {/* Request message */}
      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-2">Request Message</h2>
        <p>{data.request_message || '—'}</p>
      </div>

      {/* Attachment */}
      {data.attachment_path && (
        <div className="border p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Attachment</h2>
          <a
            href={data.attachment_path}
            target="_blank"
            className="text-blue-600 underline"
          >
            View Uploaded File
          </a>
        </div>
      )}

      {/* Decision Form */}
      <div className="border p-4 rounded-lg space-y-4">
        <h2 className="font-semibold">Decision</h2>

        <div className="flex gap-6">
          <label>
            <input type="radio" name="d" onChange={() => setDecision('approve')} />
            <span className="ml-2">Approve</span>
          </label>

          <label>
            <input type="radio" name="d" onChange={() => setDecision('reject')} />
            <span className="ml-2">Reject</span>
          </label>
        </div>

        {decision === 'approve' && (
          <div className="space-y-2">
            <label>Active Until</label>
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={activeUntil}
              onChange={(e) => setActiveUntil(e.target.value)}
            />
          </div>
        )}

        {decision === 'reject' && (
          <div className="space-y-2">
            <label>Rejection Reason</label>
            <textarea
              className="border p-2 rounded w-full"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <label>Downtime Until</label>
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={downtimeUntil}
              onChange={(e) => setDowntimeUntil(e.target.value)}
            />
          </div>
        )}

        <button
          onClick={submitDecision}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Submit Decision
        </button>
      </div>

      <Link
        href={`/${locale}/dashboards/admin`}
        className="text-blue-600 underline block mt-4"
      >
        ← Back to Admin Panel
      </Link>
    </div>
  );
}
