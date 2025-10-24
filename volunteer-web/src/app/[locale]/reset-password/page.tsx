'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'waiting' | 'verified' | 'success' | 'error'>('waiting');
  const [message, setMessage] = useState<string | null>(null);

  // Step 1: verify session when user opens the link
  useEffect(() => {
    async function verifyResetLink() {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
        setStatus('error');
        setMessage('Invalid or expired reset link.');
        return;
      }

      // Supabase automatically sets session from URL hash (#access_token=…)
      // So if there's a session, we can proceed.
      if (data?.session) {
        setStatus('verified');
      } else {
        setStatus('error');
        setMessage('Invalid or expired reset link.');
      }
    }

    verifyResetLink();
  }, []);

  // Step 2: handle password update
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        console.error(error);
        setStatus('error');
        setMessage('Failed to update password. Please try again.');
        return;
      }

      setStatus('success');
      setMessage('✅ Password updated successfully! Redirecting to login...');
      setTimeout(() => router.push('/auth?tab=login'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  // Step 3: render different states
  if (status === 'waiting') {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Verifying your reset link...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600 text-center">
        {message || 'Something went wrong. Please request another password reset link.'}
      </div>
    );
  }

  // Step 4: show password form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleReset}
        className="bg-white shadow-md rounded-xl p-8 w-full max-w-md border border-gray-200"
      >
        <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Set New Password
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full p-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          {message && (
            <p
              className={`text-sm text-center ${
                status === 'success' ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {message}
            </p>
          )}

          <div className="w-2/3 mx-auto pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-full text-sm transition text-white ${
                loading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800'
              }`}
            >
              {loading ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
