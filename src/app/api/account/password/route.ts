import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { currentPassword, newPassword } = await req.json() as {
    currentPassword: string
    newPassword: string
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  })

  if (!user?.passwordHash) {
    return NextResponse.json(
      { error: "このアカウントはパスワードが設定されていません（ソーシャルログイン）" },
      { status: 400 }
    )
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "現在のパスワードが正しくありません" }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await db.user.update({ where: { id: session.user.id }, data: { passwordHash } })

  return NextResponse.json({ success: true })
}
