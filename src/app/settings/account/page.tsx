import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import AccountForms from "./AccountForms"

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, plan: true, passwordHash: true },
  })

  const hasPassword = !!user?.passwordHash

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">Dexter</Link>
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">← ダッシュボード</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">アカウント設定</h1>
        <p className="text-gray-400 text-sm mb-8">プロフィールとパスワードを管理できます</p>

        <AccountForms
          initialName={user?.name ?? ""}
          initialEmail={user?.email ?? ""}
          plan={user?.plan ?? "FREE"}
          hasPassword={hasPassword}
        />
      </div>
    </div>
  )
}
