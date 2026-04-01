import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const chatId = req.nextUrl.searchParams.get("chatId")
  if (!chatId) return NextResponse.json({ error: "chatId required" }, { status: 400 })

  const chat = await db.chat.findFirst({
    where: { id: chatId, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  })
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const lines: string[] = [
    `Dexter JP Stock - 分析レポート`,
    `タイトル: ${chat.title ?? "無題"}`,
    `日時: ${new Date().toLocaleString("ja-JP")}`,
    ``,
    `免責事項: 本レポートは情報提供のみを目的とし、投資助言ではありません。`,
    ``,
    "=".repeat(60),
    ``,
  ]

  for (const msg of chat.messages) {
    if (msg.role !== "USER" && msg.role !== "ASSISTANT") continue
    lines.push(`[${msg.role === "USER" ? "質問" : "AI分析"}]`)
    lines.push(msg.content)
    lines.push("")
  }

  const text = lines.join("\n")

  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="dexter-analysis-${chatId}.txt"`,
    },
  })
}
