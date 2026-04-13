import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PLANS } from "@/lib/stripe"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      usage: { orderBy: { date: "desc" } },
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
    planConfig.queries === Infinity ? 0 : Math.min(100, (monthlyUsage / planConfig.queries) * 100)

  const periodEnd = user?.stripeCurrentPeriodEnd
    ? new Date(user.stripeCurrentPeriodEnd).toLocaleDateString("ja-JP")
    : null

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">Dexter</Link>
        <div className="flex items-center gap-4">
          <Link href="/settings/account" className="text-gray-400 hover:text-white text-sm">アカウント設定</Link>
          <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">← ダッシュボード</Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">プラン・請求</h1>
        <p className="text-gray-400 text-sm mb-8">現在のプランと利用状況を確認できます</p>

        {/* Current Plan */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">現在のプラン</p>
              <p className="text-2xl font-bold text-amber-400">{planConfig.name}</p>
              {periodEnd && (
                <p className="text-gray-500 text-xs mt-1">次回更新日: {periodEnd}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {planConfig.price === 0 ? "¥0" : `¥${planConfig.price.toLocaleString()}`}
              </p>
              <p className="text-gray-400 text-sm">/月</p>
            </div>
          </div>

          {/* Usage bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">今月の利用回数</span>
              <span className="text-gray-300">
                {monthlyUsage} / {monthLimit}回
              </span>
            </div>
            {planConfig.queries !== Infinity && (
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${usagePercent >= 90 ? "bg-red-500" : usagePercent >= 70 ? "bg-amber-500" : "bg-green-500"}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            )}
          </div>

          {/* Stripe portal for paid plans */}
          {plan !== "FREE" && user?.stripeId && (
            <form action="/api/stripe/portal" method="POST" className="mt-6">
              <Button type="submit" variant="outline" className="border-gray-700 text-gray-300 text-sm">
                請求・サブスクリプションを管理（Stripe）
              </Button>
            </form>
          )}
        </div>

        {/* Upgrade options */}
        {plan !== "PREMIUM" && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-300">プランをアップグレード</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {plan === "FREE" && (
                <div className="bg-gray-900 border-2 border-amber-500 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg">プロ</h3>
                    <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded">人気</span>
                  </div>
                  <p className="text-2xl font-bold mb-3">
                    ¥4,980<span className="text-sm text-gray-400 font-normal">/月</span>
                  </p>
                  <ul className="space-y-1.5 text-sm text-gray-400 mb-5">
                    <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> 月100回まで分析</li>
                    <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> 有報深堀り分析</li>
                    <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> チャット履歴・ウォッチリスト</li>
                    <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> PDF出力</li>
                  </ul>
                  <form action="/api/stripe/checkout" method="POST">
                    <input type="hidden" name="plan" value="PRO" />
                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold">
                      プロにアップグレード
                    </Button>
                  </form>
                </div>
              )}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="font-bold text-lg mb-1">プレミアム</h3>
                <p className="text-2xl font-bold mb-3">
                  ¥9,800<span className="text-sm text-gray-400 font-normal">/月</span>
                </p>
                <ul className="space-y-1.5 text-sm text-gray-400 mb-5">
                  <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> 無制限分析</li>
                  <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> プロの全機能</li>
                  <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> 決算カレンダー</li>
                  <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> 分析共有リンク</li>
                  <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> 優先サポート</li>
                </ul>
                <form action="/api/stripe/checkout" method="POST">
                  <input type="hidden" name="plan" value="PREMIUM" />
                  <Button type="submit" variant="outline" className="w-full border-gray-700 text-gray-300">
                    プレミアムにアップグレード
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {plan === "PREMIUM" && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center">
            <p className="text-amber-400 font-semibold">プレミアムプランをご利用中です</p>
            <p className="text-gray-400 text-sm mt-1">すべての機能を無制限でご利用いただけます</p>
          </div>
        )}
      </div>
    </div>
  )
}
