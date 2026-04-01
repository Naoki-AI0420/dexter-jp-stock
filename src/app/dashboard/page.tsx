import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PLANS } from "@/lib/stripe"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      chats: { orderBy: { updatedAt: "desc" }, take: 10 },
      usage: { orderBy: { date: "desc" }, take: 1 },
      watchlists: { orderBy: { createdAt: "desc" } },
    },
  })

  const plan = user?.plan ?? "FREE"
  const planConfig = PLANS[plan as keyof typeof PLANS]
  const todayUsage = user?.usage[0]?.queries ?? 0
  const monthLimit = planConfig.queries === Infinity ? "無制限" : planConfig.queries

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">Dexter</Link>
        <div className="flex items-center gap-4">
          <Link href="/chat">
            <Button className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold">
              分析を始める
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-8">ダッシュボード</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">プラン</p>
            <p className="text-2xl font-bold text-amber-400">{planConfig.name}</p>
            {plan !== "PREMIUM" && (
              <Link href="/pricing" className="text-xs text-amber-400 hover:underline mt-2 block">
                アップグレード →
              </Link>
            )}
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">今月の利用回数</p>
            <p className="text-2xl font-bold">{todayUsage} <span className="text-sm text-gray-400">/ {monthLimit}</span></p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">保存済みチャット</p>
            <p className="text-2xl font-bold">{user?.chats.length ?? 0}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Chat History */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-semibold mb-4 text-gray-300">最近の分析履歴</h2>
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
                      {chat.title ?? "無題の分析"}
                      <span className="text-gray-500 text-xs ml-2">
                        {new Date(chat.updatedAt).toLocaleDateString("ja-JP")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Watchlist */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-semibold mb-4 text-gray-300">ウォッチリスト</h2>
            {(user?.watchlists.length ?? 0) === 0 ? (
              <p className="text-gray-500 text-sm">銘柄をウォッチリストに追加できます</p>
            ) : (
              <ul className="space-y-2">
                {user!.watchlists.map(w => (
                  <li key={w.id} className="flex items-center justify-between text-sm text-gray-300 hover:bg-gray-800 rounded-lg px-3 py-2">
                    <span>{w.name}</span>
                    <span className="text-gray-500">{w.code}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-8">
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
          {plan !== "FREE" && user?.stripeId && (
            <form action="/api/stripe/portal" method="POST" className="mt-4">
              <Button type="submit" variant="outline" className="border-gray-700 text-gray-300 text-sm">
                請求・サブスクリプション管理
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
