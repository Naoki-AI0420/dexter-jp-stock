import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import { ChatMessage } from "@/components/chat/chat-message"

interface Props {
  params: Promise<{ id: string }>
}

export default async function SharePage({ params }: Props) {
  const { id } = await params

  const shared = await db.sharedAnalysis.findUnique({
    where: { slug: id },
    include: {
      chat: {
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  })

  if (!shared) notFound()

  const expired = shared.expiresAt && new Date(shared.expiresAt) < new Date()
  if (expired) notFound()

  const messages = shared.chat.messages.filter(
    m => m.role === "USER" || m.role === "ASSISTANT"
  )
  const title = shared.chat.title ?? "株式分析レポート"

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-amber-400">
          Dexter
        </Link>
        <span className="text-xs text-gray-500">共有された分析レポート</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-sky-400 mb-2">分析レポート</p>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date(shared.createdAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {messages.map(msg => (
            <ChatMessage
              key={msg.id}
              role={msg.role === "USER" ? "user" : "assistant"}
              content={msg.content}
            />
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-500 text-sm mb-4">
            この分析は <span className="text-amber-400 font-semibold">Dexter</span> で生成されました。
            <br />
            情報提供のみを目的としており、投資助言ではありません。
          </p>
          <Link
            href="/"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            Dexter で分析を始める →
          </Link>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const shared = await db.sharedAnalysis.findUnique({
    where: { slug: id },
    include: { chat: { select: { title: true } } },
  })
  if (!shared) return { title: "Not Found" }
  return {
    title: `${shared.chat.title ?? "株式分析"} — Dexter`,
    description: "Dexter が生成した日本株分析レポートです。",
  }
}
