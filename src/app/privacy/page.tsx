export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold">プライバシーポリシー</h1>
        <p className="text-gray-300">
          Dexter 日本株版は、アカウント作成、課金、利用分析のために必要な範囲で個人情報を取得します。
        </p>
        <section className="space-y-2 text-gray-300">
          <h2 className="text-xl font-semibold text-white">取り扱い方針</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>取得情報は認証、課金、サポート、品質改善の目的に限定して利用します。</li>
            <li>法令に基づく場合を除き、本人の同意なく第三者へ提供しません。</li>
            <li>決済情報はStripe等の外部決済事業者が管理します。</li>
            <li>削除依頼や問い合わせには合理的な範囲で対応します。</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
