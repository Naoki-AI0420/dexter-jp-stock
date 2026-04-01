import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const from = req.nextUrl.searchParams.get("from") ?? new Date().toISOString().slice(0, 10)
  const to = req.nextUrl.searchParams.get("to") ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)

  // Mock earnings calendar data - in production this would use J-Quants calendar tool
  const mockCalendar = [
    { date: from, code: "7203", name: "トヨタ自動車", type: "第3四半期決算" },
    { date: from, code: "6758", name: "ソニーグループ", type: "第3四半期決算" },
    { date: to, code: "6501", name: "日立製作所", type: "第3四半期決算" },
  ]

  return NextResponse.json({ calendar: mockCalendar, from, to })
}
