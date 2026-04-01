"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください")
      return
    }
    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error ?? "登録に失敗しました")
    } else {
      router.push("/login?registered=1")
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-white">Dexter</Link>
          <p className="text-gray-400 mt-2">無料アカウントを作成</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">お名前（任意）</label>
              <Input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="山田 太郎"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">メールアドレス</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">パスワード（8文字以上）</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold">
              {loading ? "登録中..." : "無料で始める"}
            </Button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-6">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/login" className="text-amber-400 hover:text-amber-300">ログイン</Link>
          </p>
          <p className="text-center text-gray-400 text-xs mt-4">
            登録することで
            <Link href="/terms" className="underline mx-1">利用規約</Link>
            および
            <Link href="/privacy" className="underline mx-1">プライバシーポリシー</Link>
            に同意したものとみなします
          </p>
        </div>
      </div>
    </div>
  )
}
