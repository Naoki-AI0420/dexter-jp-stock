import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ChatPanel } from "@/components/chat/chat-panel"
import { searchCompanies } from "@/tools/jquants/company"
import { getChartData } from "@/lib/stock"

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [featuredTicker] = await searchCompanies("トヨタ")
  const chartData = featuredTicker ? await getChartData(featuredTicker.code) : []

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_35%),linear-gradient(180deg,_#020617_0%,_#0f172a_52%,_#020617_100%)] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-sky-300">Dexter SaaS / Phase 2</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:mt-3 sm:text-5xl lg:text-6xl">
              聞くだけで、日本株の
              <span className="block text-sky-300">分析が返ってくる。</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:mt-4 sm:text-base sm:leading-8 lg:text-lg">
              J-Quants と EDINET を根拠に、決算分析、比較、スクリーニングを一画面で処理する日本株版 Dexter。
            </p>
          </div>
          <div className="self-start rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs text-amber-100 sm:rounded-full sm:px-5 sm:py-3 sm:text-sm lg:self-auto">
            本サービスは情報提供のみを目的としており、投資助言ではありません。
          </div>
        </div>

        <ChatPanel
          initialMessages={[
            {
              role: "assistant",
              content:
                "トヨタの決算、PER条件のスクリーニング、トヨタとホンダの比較、有報の読み解きなどを日本語で依頼できます。",
            },
          ]}
          chartData={chartData}
          featuredTicker={featuredTicker ?? { code: "7203", companyName: "トヨタ自動車" }}
        />
      </div>
    </main>
  )
}
