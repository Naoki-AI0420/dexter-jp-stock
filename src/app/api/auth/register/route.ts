import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 })
  }
  const exists = await db.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 })
  }
  const passwordHash = await bcrypt.hash(password, 12)
  await db.user.create({ data: { email, name, passwordHash } })
  return NextResponse.json({ ok: true })
}
