import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function HistoryPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const chats = await db.chat.findMany({
    where: { userId: session.user.id },
    include: {
      messages: {
        where: { role: "USER" },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">Dexter</Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">← ダッシュボード</Link>
          <ThemeToggle />
          <Link href="/chat">
            <Button className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold">
              新しい分析
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">分析履歴</h1>
            <p className="text-gray-400 text-sm mt-1">過去の分析チャット一覧</p>
          </div>
          <span className="text-gray-500 text-sm">{chats.length}件</span>
        </div>

        {chats.length === 0 ? (
          <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-xl">
            <p className="text-gray-400 mb-4">まだ分析履歴がありません</p>
            <Link href="/chat">
              <Button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold">
                最初の分析を始める →
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map(chat => {
              const firstMessage = chat.messages[0]?.content ?? ""
              const preview =
                firstMessage.length > 80 ? firstMessage.slice(0, 80) + "…" : firstMessage

              return (
                <Link
                  key={chat.id}
                  href={`/chat?id=${chat.id}`}
                  className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-amber-500/40 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white group-hover:text-amber-400 transition-colors truncate">
                        {chat.title ?? "無題の分析"}
                      </h3>
                      {preview && (
                        <p className="text-gray-500 text-sm mt-1 truncate">{preview}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-gray-500 text-xs">
                        {new Date(chat.updatedAt).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        {chat._count.messages}メッセージ
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
