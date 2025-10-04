import { supabase } from '@root/lib/supabase';
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json()

    if (!email || !password || !username) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 1. Sign up with Supabase Auth (sends verification email automatically)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // 2. Store extra profile info in your own DB (linked by Supabase user ID)
    if (data.user) {
      await prisma.user.create({
        data: {
          id: data.user.id, // use Supabase's UUID
          email,
          name: username,
          password: "", // don’t store raw password here
        },
      })
    }

    return NextResponse.json({ message: "Registration successful. Please check your email to verify." })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
