import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 60;

// SUPABASE SERVICE CLIENT
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ------------------------------------------------------------
    SAFE BUFFER CONVERSION
------------------------------------------------------------- */
async function toBuffer(input: File | Buffer): Promise<Buffer> {
  if (input instanceof Buffer) return input;

  if ("arrayBuffer" in input && typeof input.arrayBuffer === "function") {
    const ab = await input.arrayBuffer();
    return Buffer.from(ab);
  }

  throw new Error("Invalid input type: expected File or Buffer");
}

/* ------------------------------------------------------------
    MAIN HANDLER — FIXED FOR NEXT.JS 15
------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const title = form.get("title") as string | null;
    let categoryId = Number(form.get("categoryId"));
    if (!categoryId || isNaN(categoryId)) categoryId = 1;

    const tagsRaw = form.get("tags") as string | null;
    const tags = tagsRaw ? JSON.parse(tagsRaw) : [];

    const thumbnail = form.get("thumbnail") as File | null;
    const file = form.get("file") as File | null;

    if (!title || !categoryId || !thumbnail || !file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Size limit check
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize || thumbnail.size > maxSize) {
      return NextResponse.json(
        { error: "File exceeds 20MB limit" },
        { status: 400 }
      );
    }

    /* ------------------------------------------------------------
        USER AUTH — COOKIE READING MADE CONSISTENT
    ------------------------------------------------------------- */
    const cookieHeader = req.headers.get("cookie") ?? "";
    const uuid = cookieHeader.match(/user_id=([^;]+)/)?.[1];

    if (!uuid) {
      return NextResponse.json(
        { error: "Not logged in" },
        { status: 403 }
      );
    }

    /* ------------------------------------------------------------
        CHECK USER ROLE PERMISSION
    ------------------------------------------------------------- */
    const hasPublisher = await prisma.userRole.findFirst({
      where: {
        user_uuid: uuid,
        role_id: 3, // publisher role
        status: 2,  // active
        active_until: { gt: new Date() }
      },
    });

    if (!hasPublisher) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    /* ------------------------------------------------------------
        SUPABASE UPLOAD
    ------------------------------------------------------------- */
    async function uploadToSupabase(path: string, input: File | Buffer) {
      const buffer = await toBuffer(input);

      const { error } = await supabase.storage
        .from("news-files")
        .upload(path, buffer, { upsert: true });

      if (error) throw error;

      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/news-files/${path}`;
    }

    /* ------------------------------------------------------------
        UPLOAD THUMBNAIL
    ------------------------------------------------------------- */
    const thumbExt = thumbnail.name.split(".").pop();
    const thumbPath = `thumbnails/${crypto.randomUUID()}.${thumbExt}`;
    const thumbnailUrl = await uploadToSupabase(thumbPath, thumbnail);

    /* ------------------------------------------------------------
        UPLOAD MAIN FILE
    ------------------------------------------------------------- */
    const fileExt = file.name.split(".").pop();
    const filePath = `files/${crypto.randomUUID()}.${fileExt}`;
    const fileUrl = await uploadToSupabase(filePath, await toBuffer(file));

    /* ------------------------------------------------------------
        PREVIEW FILE (ALWAYS THUMBNAIL NOW)
    ------------------------------------------------------------- */
    const previewUrl = thumbnailUrl;

    /* ------------------------------------------------------------
        CREATE NEWS RECORD IN DATABASE
    ------------------------------------------------------------- */
    const news = await prisma.news.create({
      data: {
        title,
        categoryId,
        tags,
        authorId: uuid,
        thumbnail: thumbnailUrl,
        fileUrl,
        previewUrl
      },
    });

    return NextResponse.json({ success: true, news });
  } catch (err) {
    console.error("[CREATE NEWS ERROR]", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
