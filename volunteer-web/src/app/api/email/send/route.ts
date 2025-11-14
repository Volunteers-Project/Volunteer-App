import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { to, subject, message } = await req.json();

  if (!to) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  // Use your SMTP provider (Gmail, Mailgun, etc.)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Volunteer System" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text: message,
  });

  return NextResponse.json({ success: true });
}
