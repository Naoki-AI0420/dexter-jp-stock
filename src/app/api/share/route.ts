import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { nanoid } from "nanoid"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { chatId } = await req.json()
  const chat = await db.chat.findFirst({ where: { id: chatId, userId: session.user.id } })
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const existing = await db.sharedAnalysis.findFirst({ where: { chatId } })
  if (existing) return NextResponse.json({ slug: existing.slug })

  const slug = nanoid(10)
  await db.sharedAnalysis.create({ data: { chatId, slug } })
  return NextResponse.json({ slug })
}
