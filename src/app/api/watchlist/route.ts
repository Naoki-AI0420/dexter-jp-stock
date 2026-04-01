import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const watchlists = await db.watchlist.findMany({ where: { userId: session.user.id } })
  return NextResponse.json({ watchlists })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { code, name } = await req.json()
  const item = await db.watchlist.upsert({
    where: { userId_code: { userId: session.user.id, code } },
    create: { userId: session.user.id, code, name },
    update: { name },
  })
  return NextResponse.json({ item })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { code } = await req.json()
  await db.watchlist.deleteMany({ where: { userId: session.user.id, code } })
  return NextResponse.json({ ok: true })
}
