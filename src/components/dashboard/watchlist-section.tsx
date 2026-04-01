"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface WatchlistItem {
  id: string
  code: string
  name: string
}

export function WatchlistSection({ initial }: { initial: WatchlistItem[] }) {
  const [items, setItems] = useState<WatchlistItem[]>(initial)
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState("")

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim() || !name.trim()) return
    setAdding(true)
    setError("")
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), name: name.trim() }),
      })
      if (!res.ok) throw new Error("追加に失敗しました")
      const { item } = await res.json()
      setItems(prev => {
        const exists = prev.some(i => i.code === item.code)
        if (exists) return prev.map(i => i.code === item.code ? item : i)
        return [item, ...prev]
      })
      setCode("")
      setName("")
    } catch {
      setError("追加に失敗しました。もう一度お試しください。")
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(itemCode: string) {
    const res = await fetch("/api/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: itemCode }),
    })
    if (res.ok) {
      setItems(prev => prev.filter(i => i.code !== itemCode))
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-300">ウォッチリスト</h2>
        <span className="text-xs text-gray-600">{items.length}銘柄</span>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <Input
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="証券コード（例: 7203）"
          className="bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600 text-xs h-8 w-32"
          maxLength={6}
        />
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="企業名"
          className="bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600 text-xs h-8 flex-1"
          maxLength={50}
        />
        <Button
          type="submit"
          disabled={adding || !code.trim() || !name.trim()}
          className="bg-amber-500 hover:bg-amber-400 text-black text-xs h-8 px-3 font-semibold disabled:opacity-50"
        >
          追加
        </Button>
      </form>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">銘柄コードと企業名を入力して追加してください</p>
      ) : (
        <ul className="space-y-1">
          {items.map(w => (
            <li
              key={w.id}
              className="flex items-center justify-between text-sm hover:bg-gray-800 rounded-lg px-3 py-2 group"
            >
              <div>
                <span className="text-gray-300 font-medium">{w.name}</span>
                <span className="text-gray-600 text-xs ml-2 font-mono">{w.code}</span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={{ pathname: "/chat", query: { q: `${w.name}（${w.code}）を分析して` } }}
                  className="text-xs text-amber-500 hover:text-amber-400"
                >
                  分析 →
                </Link>
                <button
                  onClick={() => handleDelete(w.code)}
                  className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                  aria-label="削除"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
