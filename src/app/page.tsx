import Link from "next/link"
import { Button } from "@/components/ui/button"

const features = [
  { icon: "📊", title: "リアルタイム株価分析", desc: "J-Quants APIで最新データを取得。チャートと数値で瞬時に可視化" },
  { icon: "📋", title: "有価証券報告書解析", desc: "EDINETから有報を自動取得し、AIが財務リスクとハイライトを抽出" },
  { icon: "🔍", title: "多角的な比較分析", desc: "複数銘柄を横並びで比較。セクター内での優位性を定量的に評価" },
  { icon: "🤖", title: "4段階AIエージェント", desc: "計画→実行→検証→回答の4段階で精度の高い分析を自動生成" },
  { icon: "📅", title: "決算カレンダー", desc: "注目銘柄の決算スケジュールを一覧表示。見逃しゼロ" },
  { icon: "🔗", title: "分析の共有", desc: "AIの分析結果を1クリックで共有可能なリンクを発行" },
]

const problems = [
  { icon: "⏰", text: "有報を読む時間がない", solution: "AIが数秒で要約・リスク抽出" },
  { icon: "📉", text: "どの指標を見ればいいか分からない", solution: "プロ基準の指標を自動選択" },
  { icon: "🔄", text: "複数銘柄を比較するのが面倒", solution: "一言で横断比較を自動実行" },
  { icon: "🎯", text: "プロのアナリストの視点が欲しい", solution: "機関投資家水準の分析を即座に" },
  { icon: "📰", text: "情報が散在していてまとめられない", solution: "J-Quants + EDINET を統合取得" },
]

const comparisons = [
  { feature: "最新株価・財務データ", dexter: "✅ J-Quants公式（リアルタイム）", chatgpt: "❌ 学習データのみ" },
  { feature: "有価証券報告書の参照", dexter: "✅ EDINET直接取得", chatgpt: "❌ 不可" },
  { feature: "財務数値の正確性", dexter: "✅ 公式データソース保証", chatgpt: "⚠️ ハルシネーションリスクあり" },
  { feature: "日本株への特化", dexter: "✅ 完全特化", chatgpt: "❌ 汎用（日本市場は不得意）" },
  { feature: "投資免責事項", dexter: "✅ 全回答に自動付与", chatgpt: "⚠️ 手動で確認が必要" },
  { feature: "決算カレンダー連携", dexter: "✅ 銘柄別スケジュール管理", chatgpt: "❌ 非対応" },
]

const faqs = [
  {
    q: "データはどこから取得していますか？",
    a: "J-Quants API（JPX公式）とEDINET（金融庁）から直接取得しています。第三者が加工したデータではなく、一次情報源のみを使用します。",
  },
  {
    q: "ChatGPTと何が違うのですか？",
    a: "ChatGPTは学習時点のデータしか参照できず、有報や最新株価は取得不可です。DexterはJ-Quants・EDINETにリアルタイムアクセスし、数値の正確性を担保します。",
  },
  {
    q: "投資判断に使えますか？",
    a: "本サービスは情報提供のみを目的としています。投資判断はご自身の責任で行ってください。すべての回答に免責事項が自動付与されます。",
  },
  {
    q: "解約はいつでもできますか？",
    a: "いつでも解約可能です。解約後は期間終了まで引き続きご利用いただけます。",
  },
  {
    q: "無料プランで試せますか？",
    a: "クレジットカード不要で月5回まで無料でご利用いただけます。まずはお気軽にお試しください。",
  },
  {
    q: "対応している銘柄は？",
    a: "JPX上場の全銘柄（東証プライム・スタンダード・グロース）に対応しています。ETFや海外銘柄は現在対象外です。",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-gray-950/95 backdrop-blur-sm z-50">
        <span className="text-xl font-bold text-white">Dexter</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-400 hover:text-white text-sm">ログイン</Link>
          <Link href="/register">
            <Button className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold px-4 py-2">
              無料で始める
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-amber-400 text-sm mb-8">
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          J-Quants × EDINET × Claude AI
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          聞くだけで、
          <span className="text-amber-400">日本株の分析</span>が
          <br />返ってくる
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          機関投資家のアナリストが行う作業をAIが代替。有報解析・財務比較・リスク抽出を自然言語で即座に実行します。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3 text-lg">
              無料で試す →
            </Button>
          </Link>
          <Link href="#features" className="text-gray-400 hover:text-white text-sm">
            機能を見る ↓
          </Link>
        </div>
        <p className="text-gray-500 text-sm mt-4">クレジットカード不要 • 月5回まで無料</p>
      </section>

      {/* Problem → Solution */}
      <section className="px-6 py-16 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">こんな悩み、ありませんか？</h2>
          <p className="text-gray-400 text-center mb-12">個人投資家が毎日感じる5つの課題をDexterが解決します</p>
          <div className="grid sm:grid-cols-1 gap-3">
            {problems.map(p => (
              <div key={p.text} className="flex items-center gap-4 bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                <span className="text-2xl shrink-0">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 font-medium">{p.text}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                  <span className="text-amber-400 text-xs font-semibold whitespace-nowrap">→ {p.solution}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">主な機能</h2>
        <p className="text-gray-400 text-center mb-12">プロのアナリスト水準の分析をAIが自動実行</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-amber-500/50 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ChatGPT Comparison */}
      <section className="px-6 py-16 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">ChatGPTとの違い</h2>
          <p className="text-gray-400 text-center mb-10">汎用AIと日本株特化AIの決定的な差</p>
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/80">
                  <th className="text-left px-4 py-3 text-gray-300 font-semibold">機能</th>
                  <th className="text-center px-4 py-3 text-amber-400 font-semibold">Dexter</th>
                  <th className="text-center px-4 py-3 text-gray-400 font-semibold">ChatGPT</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-gray-800 ${i % 2 === 0 ? "bg-gray-900" : "bg-gray-900/50"}`}>
                    <td className="px-4 py-3 text-gray-300">{row.feature}</td>
                    <td className="px-4 py-3 text-center text-gray-300">{row.dexter}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{row.chatgpt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Demo Chat */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">こんな質問に答えます</h2>
          <p className="text-gray-400 text-center mb-10">日本語で質問するだけ</p>
          <div className="space-y-3">
            {[
              "トヨタの最新決算を分析して",
              "半導体セクターの主要銘柄を比較して",
              "ソニーの有価証券報告書のリスク要因を教えて",
              "PBR1倍割れで利益成長している銘柄をスクリーニングして",
            ].map(q => (
              <div key={q} className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-300">
                <span className="text-amber-400">→</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/register">
              <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3">
                今すぐ試してみる →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">料金プラン</h2>
          <p className="text-gray-400 text-center mb-12">まずは無料でお試しください。いつでもアップグレード・解約可能</p>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-1">フリー</h3>
              <div className="text-3xl font-bold mb-1">¥0<span className="text-sm text-gray-400 font-normal">/月</span></div>
              <p className="text-gray-500 text-xs mb-4">クレカ不要</p>
              <ul className="space-y-2 text-sm text-gray-400 mb-6">
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> 月5回まで分析</li>
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> 基本株価分析</li>
                <li className="flex items-center gap-2"><span className="text-gray-600">✗</span> 有報深堀り</li>
                <li className="flex items-center gap-2"><span className="text-gray-600">✗</span> チャット履歴保存</li>
                <li className="flex items-center gap-2"><span className="text-gray-600">✗</span> ウォッチリスト</li>
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full border-gray-700 text-gray-300">無料で始める</Button>
              </Link>
            </div>
            {/* Pro */}
            <div className="bg-gray-900 border-2 border-amber-500 rounded-xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">人気No.1</div>
              <h3 className="text-lg font-bold mb-1">プロ</h3>
              <div className="text-3xl font-bold mb-1">¥4,980<span className="text-sm text-gray-400 font-normal">/月</span></div>
              <p className="text-gray-500 text-xs mb-4">月払い・いつでも解約可</p>
              <ul className="space-y-2 text-sm text-gray-400 mb-6">
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> 月100回まで分析</li>
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> 有報深堀り分析</li>
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> チャット履歴保存</li>
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> ウォッチリスト</li>
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> PDF出力</li>
              </ul>
              <Link href="/register">
                <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold">今すぐ始める</Button>
              </Link>
            </div>
            {/* Premium */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-1">プレミアム</h3>
              <div className="text-3xl font-bold mb-1">¥9,800<span className="text-sm text-gray-400 font-normal">/月</span></div>
              <p className="text-gray-500 text-xs mb-4">ヘビーユーザー向け</p>
              <ul className="space-y-2 text-sm text-gray-400 mb-6">
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> 無制限分析</li>
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> プロの全機能</li>
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> 決算カレンダー</li>
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> 分析共有リンク</li>
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> 優先サポート</li>
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full border-gray-700 text-gray-300">今すぐ始める</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">よくある質問</h2>
          <div className="space-y-4">
            {faqs.map(faq => (
              <div key={faq.q} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="font-semibold mb-2 text-white">Q. {faq.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center bg-gray-900/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">今すぐ日本株分析を始める</h2>
          <p className="text-gray-400 mb-2">無料プランからスタート。クレジットカード不要</p>
          <p className="text-gray-500 text-sm mb-8">5分で登録完了。すぐに分析を試せます</p>
          <Link href="/register">
            <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-4 text-lg">
              無料で始める →
            </Button>
          </Link>
          <p className="text-gray-600 text-xs mt-4">いつでも解約可能 • 個人情報は厳重に管理</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-6 mb-4 text-xs">
          <Link href="/login" className="hover:text-gray-300">ログイン</Link>
          <Link href="/register" className="hover:text-gray-300">新規登録</Link>
          <Link href="#faq" className="hover:text-gray-300">FAQ</Link>
          <Link href="#pricing" className="hover:text-gray-300">料金</Link>
        </div>
        <p className="mb-2">© 2024 Dexter JP Stock. All rights reserved.</p>
        <p className="text-xs text-gray-600">本サービスは情報提供のみを目的としており、投資助言ではありません。投資に関する最終判断はご自身の責任においてお願いします。</p>
      </footer>
    </div>
  )
}
