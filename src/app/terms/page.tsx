export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold">利用規約</h1>
        <p className="text-gray-300">
          Dexter 日本株版は、投資判断の参考情報を提供するサービスです。最終的な投資判断は利用者自身の責任で行ってください。
        </p>
        <section className="space-y-2 text-gray-300">
          <h2 className="text-xl font-semibold text-white">主な条項</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>本サービスの情報は正確性・完全性を保証しません。</li>
            <li>不正利用、リバースエンジニアリング、過度な負荷をかける行為を禁止します。</li>
            <li>料金、機能、提供内容は予告なく変更される場合があります。</li>
            <li>法令違反または第三者権利侵害が確認された場合、利用停止できるものとします。</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
