'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import Image from 'next/image';
import ProfileTabs from './components/ProfileTabs';
import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from './utils/cropImage';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Role {
  name: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Cropping states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showCropper, setShowCropper] = useState(false);

  // 🧩 Fetch user + roles
  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        const res = await fetch(`/api/user/${data.user.id}/roles`);
        if (res.ok) setRoles(await res.json());
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  // 📸 Step 1: Select image → open cropper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowCropper(true);
    }
  };

  // 📸 Step 2: Update crop area
  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  // 📸 Step 3: Upload cropped image
  const handleUpload = async () => {
    if (!selectedFile || !croppedAreaPixels || !user) return;

    const croppedBlob = await getCroppedImg(
      URL.createObjectURL(selectedFile),
      croppedAreaPixels
    );

    if (!croppedBlob) {
      alert('Cropping failed.');
      return;
    }

    const fileName = `${user.id}-${Date.now()}.png`;

    // Delete old avatar if exists
    const oldUrl = user.user_metadata?.avatar_url;
    if (oldUrl) {
      const oldPath = oldUrl.split('/storage/v1/object/public/avatars/')[1];
      if (oldPath) await supabase.storage.from('avatars').remove([oldPath]);
    }

    // Upload cropped image to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, croppedBlob, { upsert: true });

    if (uploadError) {
      alert('❌ Upload failed.');
      console.error(uploadError);
      return;
    }

    // Get public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

    // Update Supabase Auth user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    if (updateError) {
      alert('❌ Failed to update user metadata.');
      console.error(updateError);
      return;
    }

    // Refresh user info
    const { data: refreshed } = await supabase.auth.getUser();
    if (refreshed.user) setUser(refreshed.user);

    setShowCropper(false);
    setSelectedFile(null);
    alert('✅ Profile picture updated!');
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user)
    return (
      <p className="p-6 text-center text-gray-600">
        Please log in to view your profile.
      </p>
    );

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl shadow-lg w-96 relative">
            <h3 className="text-center mb-3 font-semibold">
              Adjust your profile picture
            </h3>

            <div className="relative w-full h-80 bg-gray-200">
              <Cropper
                image={selectedFile ? URL.createObjectURL(selectedFile) : ''}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>

            <div className="flex justify-center mt-4 gap-3">
              <button
                onClick={() => setShowCropper(false)}
                className="px-4 py-2 rounded-full bg-gray-300 text-gray-800 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center border border-gray-200 mt-10">
        <div className="flex justify-center mb-4">
          <label className="cursor-pointer relative">
            {user?.user_metadata?.avatar_url ? (
              <Image
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata.full_name || 'Profile Avatar'}
                width={100}
                height={100}
                className="rounded-full object-cover border border-gray-300"
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center rounded-full bg-white border border-gray-300 shadow-sm">
                <span className="text-gray-700 text-3xl">👤</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>

        <h2 className="text-2xl font-semibold mb-1">
          {user.user_metadata?.full_name || 'Unnamed User'}
        </h2>
        <p className="text-gray-500 mb-4">{user.email}</p>

        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <h3 className="font-medium text-gray-700 mb-1">Roles</h3>
          {roles.length > 0 ? (
            <ul className="text-sm text-gray-600">
              {roles.map((r) => (
                <li key={r.name}>• {r.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Volunteer</p>
          )}
        </div>
      </div>

      <div className="w-full max-w-5xl mt-8">
        <ProfileTabs user={user} />
      </div>
    </div>
  );
}
