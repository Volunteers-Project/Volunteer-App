import { NextResponse } from "next/server";


import { createClient } from "@supabase/supabase-js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import worker from "pdfjs-dist/legacy/build/pdf.worker.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = worker;

import { renderAsync } from "docx-preview";
import puppeteer from "puppeteer";
import { JSDOM } from "jsdom";

export const runtime = "nodejs";
export const maxDuration = 60;

import { prisma } from "@/lib/prisma";


// SUPABASE SERVICE CLIENT
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ------------------------------------------------------------
    SAFE BUFFER CONVERSION
------------------------------------------------------------- */
async function toBuffer(input: File | Buffer): Promise<Buffer> {
  // If already a Buffer → return directly
  if (input instanceof Buffer) {
    return input;
  }

  // If it is a File (has arrayBuffer)
  if ("arrayBuffer" in input && typeof input.arrayBuffer === "function") {
    const ab = await input.arrayBuffer();
    return Buffer.from(ab);
  }

  throw new Error("Invalid input type: expected File or Buffer");
}


/* ------------------------------------------------------------
    MAIN HANDLER
------------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const title = form.get("title") as string;
    let categoryId = Number(form.get("categoryId"));

    // If no category is selected → set default = 1
    if (!categoryId || isNaN(categoryId)) {
      categoryId = 1;
    }

    const tags = JSON.parse(form.get("tags") as string);
    const thumbnail = form.get("thumbnail") as File | null;
    const file = form.get("file") as File | null;

    // Required fields
    if (!title || !categoryId || !thumbnail || !file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // File size limit: 20MB
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize || thumbnail.size > maxSize) {
      return NextResponse.json(
        { error: "File exceeds 20MB limit" },
        { status: 400 }
      );
    }

    // Get UUID from cookie
    const cookie = req.headers.get("cookie") ?? "";
    const uuid = cookie.match(/user_id=([^;]+)/)?.[1];

    if (!uuid) {
      return NextResponse.json({ error: "Not logged in" }, { status: 403 });
    }

    // Check publisher permission
    const hasPublisher = await prisma.userRole.findFirst({
      where: {
        user_uuid: uuid,
        role_id: 3, // publisher
        status: 2, // active
        active_until: { gt: new Date() }
      },
    });

    if (!hasPublisher) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* ------------------------------------------------------------
        UPLOAD TO SUPABASE
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
        1) UPLOAD THUMBNAIL
    ------------------------------------------------------------- */
    const extThumb = thumbnail.name.split(".").pop();
    const thumbPath = `thumbnails/${crypto.randomUUID()}.${extThumb}`;
    const thumbnailUrl = await uploadToSupabase(thumbPath, thumbnail);

    /* ------------------------------------------------------------
        2) UPLOAD MAIN FILE
    ------------------------------------------------------------- */
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const filePath = `files/${crypto.randomUUID()}.${fileExt}`;
    const fileBuffer = await toBuffer(file);
    const fileUrl = await uploadToSupabase(filePath, fileBuffer);

    /* ------------------------------------------------------------
        3) GENERATE PREVIEW
    ------------------------------------------------------------- */
    let previewUrl: string | null = null;

    try {
      if (fileExt === "pdf") {
        previewUrl = await generatePDFPreview(fileBuffer);
      } else if (fileExt === "docx") {
        previewUrl = await generateDOCXPreview(fileBuffer);
      }
    } catch (err) {
      console.warn("Preview generation failed:", err);
    }

    if (!previewUrl) previewUrl = thumbnailUrl;

    /* ------------------------------------------------------------
        4) INSERT INTO DATABASE
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
    console.error("Create news error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ------------------------------------------------------------
    PDF PREVIEW GENERATOR
------------------------------------------------------------- */
async function generatePDFPreview(buffer: Buffer): Promise<string> {
  const pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
  const page = await pdfDoc.getPage(1);

  const viewport = page.getViewport({ scale: 1.5 });
  const canvasFactory = new pdfjsLib.NodeCanvasFactory();
  const canvas = canvasFactory.create(viewport.width, viewport.height);

  await page.render({
    canvasContext: canvas.context,
    viewport,
    canvasFactory,
  }).promise;

  const png = canvas.canvas.toBuffer();
  const path = `previews/${crypto.randomUUID()}.png`;

  const { error } = await supabase.storage
    .from("news-files")
    .upload(path, png, { upsert: true });

  if (error) throw error;

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/news-files/${path}`;
}

/* ------------------------------------------------------------
    DOCX PREVIEW GENERATOR
------------------------------------------------------------- */
async function generateDOCXPreview(buffer: Buffer): Promise<string> {
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );

  const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
  const document = dom.window.document;
  const bodyContainer = document.body;

  // Render DOCX inside virtual DOM
  await renderAsync(arrayBuffer, bodyContainer);

  const html = document.documentElement.outerHTML;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const png = await page.screenshot({ fullPage: true });
  await browser.close();

  const path = `previews/${crypto.randomUUID()}.png`;

  const { error } = await supabase.storage
    .from("news-files")
    .upload(path, png, { upsert: true });

  if (error) throw error;

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/news-files/${path}`;
}
