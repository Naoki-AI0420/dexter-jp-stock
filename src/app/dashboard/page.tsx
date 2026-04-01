import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PLANS } from "@/lib/stripe"
import { WatchlistSection } from "@/components/dashboard/watchlist-section"

interface CalendarEntry {
  date: string
  code: string
  name: string
  type: string
}

function getUpcomingEarnings(): CalendarEntry[] {
  const now = new Date()
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const plus = (days: number) => fmt(new Date(now.getTime() + days * 86400000))

  // Mock data representative of J-Quants earnings schedule
  return [
    { date: plus(3),  code: "7203", name: "トヨタ自動車",   type: "第3四半期決算" },
    { date: plus(5),  code: "6758", name: "ソニーグループ", type: "第3四半期決算" },
    { date: plus(8),  code: "9984", name: "ソフトバンクG",  type: "第3四半期決算" },
    { date: plus(10), code: "6501", name: "日立製作所",     type: "第3四半期決算" },
    { date: plus(14), code: "8306", name: "三菱UFJ FG",     type: "第3四半期決算" },
  ]
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      chats: { orderBy: { updatedAt: "desc" }, take: 10 },
      usage: { orderBy: { date: "desc" } },
      watchlists: { orderBy: { createdAt: "desc" } },
    },
  })

  const plan = (user?.plan ?? "FREE") as keyof typeof PLANS
  const planConfig = PLANS[plan]

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthlyUsage = (user?.usage ?? [])
    .filter(u => new Date(u.date) >= startOfMonth)
    .reduce((sum, u) => sum + u.queries, 0)

  const monthLimit = planConfig.queries === Infinity ? "無制限" : planConfig.queries
  const usagePercent =
    planConfig.queries === Infinity
      ? 0
      : Math.min(100, (monthlyUsage / (planConfig.queries as number)) * 100)

  const calendar = getUpcomingEarnings()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">Dexter</Link>
        <div className="flex items-center gap-4">
          <Link href="/history" className="text-gray-400 hover:text-white text-sm">履歴</Link>
          <Link href="/settings/billing" className="text-gray-400 hover:text-white text-sm">プラン</Link>
          <Link href="/chat">
            <Button className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold">
              分析を始める
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-8">ダッシュボード</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">プラン</p>
            <p className="text-2xl font-bold text-amber-400">{planConfig.name}</p>
            {plan !== "PREMIUM" && (
              <Link href="/settings/billing" className="text-xs text-amber-400 hover:underline mt-2 block">
                アップグレード →
              </Link>
            )}
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">今月の利用回数</p>
            <p className="text-2xl font-bold">
              {monthlyUsage} <span className="text-sm text-gray-400">/ {monthLimit}</span>
            </p>
            {planConfig.queries !== Infinity && (
              <div className="w-full bg-gray-800 rounded-full h-1.5 mt-3">
                <div
                  className={`h-1.5 rounded-full ${usagePercent >= 90 ? "bg-red-500" : usagePercent >= 70 ? "bg-amber-500" : "bg-green-500"}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            )}
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">保存済みチャット</p>
            <p className="text-2xl font-bold">{user?.chats.length ?? 0}</p>
            {(user?.chats.length ?? 0) > 0 && (
              <Link href="/history" className="text-xs text-gray-500 hover:text-gray-300 mt-2 block">
                すべて見る →
              </Link>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Chat History */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-300">最近の分析履歴</h2>
              <Link href="/history" className="text-xs text-gray-500 hover:text-gray-300">
                すべて見る
              </Link>
            </div>
            {(user?.chats.length ?? 0) === 0 ? (
              <p className="text-gray-500 text-sm">まだ分析履歴がありません</p>
            ) : (
              <ul className="space-y-2">
                {user!.chats.map(chat => (
                  <li key={chat.id}>
                    <Link
                      href={`/chat?id=${chat.id}`}
                      className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg px-3 py-2 transition-colors"
                    >
                      <span className="truncate block">{chat.title ?? "無題の分析"}</span>
                      <span className="text-gray-500 text-xs">
                        {new Date(chat.updatedAt).toLocaleDateString("ja-JP")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Watchlist */}
          <WatchlistSection initial={user?.watchlists ?? []} />
        </div>

        {/* Earnings Calendar */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-300">決算カレンダー（今後30日）</h2>
            <span className="text-xs text-gray-600">J-Quants 連携</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">決算日</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">コード</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">企業名</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">種別</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {calendar.map(entry => (
                  <tr key={`${entry.code}-${entry.date}`} className="border-b border-gray-800/50 hover:bg-gray-800/40">
                    <td className="py-2.5 px-3 text-gray-400">
                      {new Date(entry.date).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 font-mono">{entry.code}</td>
                    <td className="py-2.5 px-3 text-gray-300">{entry.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-2 py-0.5">
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href={`/chat?q=${encodeURIComponent(`${entry.name}（${entry.code}）の決算を分析して`)}`}
                        className="text-xs text-gray-500 hover:text-amber-400 transition-colors"
                      >
                        分析 →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="font-semibold mb-4 text-gray-300">アカウント設定</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-gray-400">
              <span>メールアドレス</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>お名前</span>
              <span>{user?.name ?? "未設定"}</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>プラン</span>
              <span>{planConfig.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Link href="/settings/billing">
              <Button variant="outline" className="border-gray-700 text-gray-300 text-sm">
                プラン・請求管理
              </Button>
            </Link>
            {plan !== "FREE" && user?.stripeId && (
              <form action="/api/stripe/portal" method="POST">
                <Button type="submit" variant="outline" className="border-gray-700 text-gray-300 text-sm">
                  Stripe ポータル
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
