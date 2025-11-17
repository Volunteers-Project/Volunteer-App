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
    MAIN HANDLER (CLEANED, CATEGORY REMOVED)
------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const title = form.get("title") as string | null;
    const tagsRaw = form.get("tags") as string | null;
    const tags = tagsRaw ? JSON.parse(tagsRaw) : [];

    const thumbnail = form.get("thumbnail") as File | null;
    const file = form.get("file") as File | null;

    if (!title || !thumbnail || !file) {
      return NextResponse.json(
        { error: "Missing required fields: title, thumbnail, file" },
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
        USER AUTH (COOKIE)
    ------------------------------------------------------------- */
    const cookieHeader = req.headers.get("cookie") ?? "";
    const uuid = cookieHeader.match(/user_id=([^;]+)/)?.[1];

    if (!uuid) {
      return NextResponse.json({ error: "Not logged in" }, { status: 403 });
    }

    /* ------------------------------------------------------------
        PERMISSION CHECK (Publisher Role)
    ------------------------------------------------------------- */
    const hasPublisher = await prisma.userRole.findFirst({
      where: {
        user_uuid: uuid,
        role_id: 3,         // Publisher
        status: 2,          // Active
        active_until: { gt: new Date() }
      },
    });

    if (!hasPublisher) {
      return NextResponse.json({ error: "Forbidden: not a publisher" }, { status: 403 });
    }

    /* ------------------------------------------------------------
        SUPABASE UPLOAD FUNCTION
    ------------------------------------------------------------- */
    async function uploadToSupabase(path: string, input: File | Buffer) {
      const buffer = await toBuffer(input);
      const { error } = await supabase.storage
        .from("news-files")
        .upload(path, buffer, { upsert: true });

      if (error) {
        console.error("Supabase Upload Error:", error);
        throw new Error(`Supabase upload failed: ${error.message}`);
      }

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
        PREVIEW = THUMBNAIL
    ------------------------------------------------------------- */
    const previewUrl = thumbnailUrl;

    /* ------------------------------------------------------------
        SAVE TO DATABASE (NO CATEGORY)
    ------------------------------------------------------------- */
    const news = await prisma.news.create({
      data: {
        title,
        tags,
        authorId: uuid,
        thumbnail: thumbnailUrl,
        fileUrl,
        previewUrl,
      },
    });

    return NextResponse.json({ success: true, news });
  } catch (err: unknown) {
  const error = err instanceof Error ? err : new Error("Unknown error");

  console.error("[CREATE NEWS ERROR]:", {
    name: error.name,
    message: error.message,
    stack: error.stack,
  });

  return NextResponse.json(
    {
      error: "Server error",
      message: error.message,
    },
    { status: 500 }
  );
}
}
