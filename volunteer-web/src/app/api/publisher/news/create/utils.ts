import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import worker from "pdfjs-dist/legacy/build/pdf.worker.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = worker;
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function uploadPreview(path: string, buffer: Buffer) {
  const { error } = await supabase.storage
    .from("news-files")
    .upload(path, buffer, { upsert: true, contentType: "image/png" });

  if (error) throw error;

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/news-files/${path}`;
}

// -------------------------
// PDF → PNG
// -------------------------
export async function generatePDFPreview(file: Buffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: file }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });

  const canvasFactory = new pdfjsLib.NodeCanvasFactory();
  const { canvas, context } = canvasFactory.create(
    viewport.width,
    viewport.height
  );

  await page.render({
    canvasContext: context,
    viewport,
    canvasFactory,
  }).promise;

  const png = canvas.toBuffer();
  const path = `previews/${crypto.randomUUID()}.png`;

  return uploadPreview(path, png);
}
