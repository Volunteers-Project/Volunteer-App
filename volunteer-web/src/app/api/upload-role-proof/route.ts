import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service key here (server-side only)
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const user_uuid = formData.get('user_uuid') as string | null;

    if (!file || !user_uuid)
      return NextResponse.json({ error: 'Missing file or user ID' }, { status: 400 });

    // 📏 Validate file size (limit 5 MB)
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: 'File exceeds 5 MB limit' }, { status: 400 });

    const ext = file.name.split('.').pop();
    const filePath = `proofs/${user_uuid}-${Date.now()}-${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('role-proofs')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('role-proofs').getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error('Error uploading file:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
