'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import {
  RoleStatusCode,
  RoleDetails,
  RoleWithStatus,
} from './types'; // adjust the path if needed


export default function RoleRequestTab({ user }: { user: User }) {
  const [roles, setRoles] = useState<RoleWithStatus[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleWithStatus | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load roles with statuses
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/roles-with-status?user_uuid=${user.id}`);
      if (res.ok) {
        const data: RoleWithStatus[] = await res.json();
        setRoles(data);
      }
    }
    load();
  }, [user.id]);

  // Drag & drop
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  // Submit role request
  const handleSubmit = async () => {
    if (!selectedRole || !selectedRole.canApply) return;

    setSubmitting(true);
    let attachmentUrl: string | null = null;

    // Upload file if exists
    if (file) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('user_uuid', user.id);

      const uploadRes = await fetch('/api/upload-role-proof', {
        method: 'POST',
        body: fd,
      });

      if (!uploadRes.ok) {
        alert('File upload failed.');
        setSubmitting(false);
        return;
      }

      const uploaded = await uploadRes.json();
      attachmentUrl = uploaded.url;
    }

    // Submit request
    const res = await fetch('/api/role-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_uuid: user.id,
        role_id: selectedRole.id,
        message,
        attachment_url: attachmentUrl,
      }),
    });

    if (res.ok) {
      alert('Role request submitted!');
      setSelectedRole(null);
      setMessage('');
      setFile(null);
    } else {
      const err = await res.json();
      alert(err.error);
    }

    setSubmitting(false);
  };

  return (
    <div className="space-y-8">
      <h4 className="text-xl font-semibold">Request a Role</h4>

      {/* SELECT BOX */}
      <div>
        <label className="block mb-1 text-gray-600">Select Role</label>
        <select
          className="w-full p-3 border rounded-lg"
          value={selectedRole?.id || ''}
          onChange={(e) => {
            const role = roles.find((r) => r.id === Number(e.target.value)) ?? null;
            setSelectedRole(role);
          }}
        >
          <option value="">-- Choose a Role --</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
              {role.userStatus === 1 && ' (Pending)'}
              {role.userStatus === 2 && ' (Active)'}
              {role.userStatus === 5 && ' (Renewable)'}
            </option>
          ))}
        </select>
      </div>

      {/* ROLE INFORMATION PANEL */}
      {selectedRole && (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
          <h5 className="text-lg font-semibold">{selectedRole.name}</h5>

          {/* NEVER HAD */}
          {selectedRole.userStatus === 0 && <p>You do not have this role yet.</p>}

          {/* PENDING */}
          {selectedRole.userStatus === 1 && selectedRole.details && (
            <>
              <p>Status: Pending</p>
              <p>Requested on: {new Date(selectedRole.details.created_at!).toLocaleDateString()}</p>
            </>
          )}

          {/* ACTIVE */}
          {selectedRole.userStatus === 2 && selectedRole.details && (
            <>
              <p>Status: Active</p>
              <p>
                Expires:{' '}
                {new Date(selectedRole.details.active_until!).toLocaleDateString()}
              </p>
              <p>You can renew within 30 days before expiration.</p>
            </>
          )}

          {/* RENEWABLE */}
          {selectedRole.userStatus === 5 && selectedRole.details && (
            <>
              <p>Status: Renewable</p>
              <p>
                Expires:{' '}
                {new Date(selectedRole.details.active_until!).toLocaleDateString()}
              </p>
              <p>You may renew now.</p>
            </>
          )}

          {/* REJECTED */}
          {selectedRole.userStatus === 3 && selectedRole.details && (
            <>
              <p>Status: Rejected</p>
              <p>Reason: {selectedRole.details.rejection_reason}</p>
              <p>
                You may reapply on:{' '}
                {new Date(selectedRole.details.downtime_until!).toLocaleDateString()}
              </p>
            </>
          )}

          {/* EXPIRED */}
          {selectedRole.userStatus === 4 && selectedRole.details && (
            <>
              <p>Status: Expired</p>
              <p>
                Expired on:{' '}
                {new Date(selectedRole.details.expiry_date!).toLocaleDateString()}
              </p>
              <p>You may reapply now.</p>
            </>
          )}
        </div>
      )}

      

      {/* DRAG & DROP UPLOAD */}
      {selectedRole?.canApply && (
        <>
          {/* Drag & Drop Upload */}
          <div
            className="border-2 border-dashed p-6 text-center rounded-lg bg-white cursor-pointer"
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('role-proof-input')?.click()}
          >
            {file ? (
              <>
                <p className="font-medium">Selected File:</p>
                <p>{file.name}</p>
                <button
                  className="mt-3 px-3 py-1 bg-gray-200 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  Remove File
                </button>
              </>
            ) : (
              <p>Drag & drop here, or <span className="underline">click to upload</span></p>
            )}

            <input
              id="role-proof-input"
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setFile(e.target.files[0]);
              }}
            />
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 mt-2">
            Only JPG, PNG, and PDF files are allowed. Maximum size: 5MB.
          </p>
        </>
      )}


      {/* MESSAGE + SUBMIT */}
      {selectedRole?.canApply && (
        <>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Explain why you are requesting this role"
          />

          <button
            disabled={submitting}
            onClick={handleSubmit}
            className={`w-full py-2 rounded-full text-white ${
              submitting
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800'
            }`}
          >
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </>
      )}
    </div>
  );
}
