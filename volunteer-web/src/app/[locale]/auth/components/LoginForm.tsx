'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginForm() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        setError('❌ Invalid email or password.');
        setLoading(false);
        return;
      }

      // ⭐ After login, fetch user info
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (user) {
        // ⭐ Store user_id in a cookie (valid for 7 days)
        document.cookie = `user_id=${user.id}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      }

      router.push(`/${currentLocale}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('⚠️ Failed to connect. Please try again later.');
    } finally {
      setLoading(false);
    }
  }


  async function handleForgotPassword() {
    setError(null);
    setResetMessage(null);

    if (!form.email) {
      setError('Please enter your email first.');
      return;
    }

    try {
      const redirectURL = `${window.location.origin}/${currentLocale}/reset-password`;
      // console.log(redirectURL);
      const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: redirectURL,
      });

      if (error) {
        console.error(error);
        setError('⚠️ Failed to send reset link. Try again later.');
      } else {
        setResetMessage('📩 Password reset link sent! Check your email.');
      }
    } catch (err) {
      console.error(err);
      setError('⚠️ Unexpected error. Please try again later.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-4/5 mx-auto">
      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="w-full p-3 rounded-full border focus:outline-none transition-all duration-300 
            focus:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          required
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => handleChange('password', e.target.value)}
          className="w-full p-3 rounded-full border focus:outline-none transition-all duration-300 
            focus:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          required
        />
      </div>

      <div className="text-right">
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-gray-600 hover:text-black underline"
        >
          Forgot password?
        </button>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {resetMessage && <p className="text-green-600 text-sm text-center">{resetMessage}</p>}

      <div className="w-2/3 mx-auto">
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-full text-sm transition text-white ${
            loading
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-black hover:bg-gray-800'
          }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </form>
  );
}
