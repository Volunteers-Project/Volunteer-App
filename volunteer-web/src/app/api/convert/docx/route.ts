import { NextResponse } from "next/server";
import mammoth from "mammoth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  // 1️⃣ Convert Blob → ArrayBuffer correctly
  const ab = await file.arrayBuffer();

  // 2️⃣ Convert ArrayBuffer → Node Buffer (Mammoth prefers this)
  const buffer = Buffer.from(ab);

  // 3️⃣ Explicitly wrap inside { buffer }
  const result = await mammoth.convertToHtml({ buffer });

  // result.value contains HTML
  return NextResponse.json({ html: result.value });
}
