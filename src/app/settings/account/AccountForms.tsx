"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  initialName: string
  initialEmail: string
  plan: string
  hasPassword: boolean
}

export default function AccountForms({ initialName, initialEmail, plan, hasPassword }: Props) {
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [profileStatus, setProfileStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwStatus, setPwStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [pwLoading, setPwLoading] = useState(false)

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileStatus(null)
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setProfileStatus({ ok: false, msg: data.error ?? "エラーが発生しました" })
      } else {
        setProfileStatus({ ok: true, msg: "プロフィールを更新しました" })
      }
    } catch {
      setProfileStatus({ ok: false, msg: "ネットワークエラーが発生しました" })
    } finally {
      setProfileLoading(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwStatus(null)
    if (newPassword !== confirmPassword) {
      setPwStatus({ ok: false, msg: "新しいパスワードが一致しません" })
      return
    }
    if (newPassword.length < 8) {
      setPwStatus({ ok: false, msg: "パスワードは8文字以上で設定してください" })
      return
    }
    setPwLoading(true)
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPwStatus({ ok: false, msg: data.error ?? "エラーが発生しました" })
      } else {
        setPwStatus({ ok: true, msg: "パスワードを変更しました" })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch {
      setPwStatus({ ok: false, msg: "ネットワークエラーが発生しました" })
    } finally {
      setPwLoading(false)
    }
  }

  const planLabels: Record<string, string> = {
    FREE: "フリー",
    PRO: "プロ",
    PREMIUM: "プレミアム",
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-1">プロフィール</h2>
        <p className="text-gray-400 text-sm mb-5">名前とメールアドレスを変更できます</p>

        <div className="mb-4 flex items-center gap-3">
          <span className="text-gray-400 text-sm">現在のプラン</span>
          <span className="bg-amber-500/20 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full">
            {planLabels[plan] ?? plan}
          </span>
          <a href="/settings/billing" className="text-amber-400 hover:text-amber-300 text-xs underline">
            プラン変更
          </a>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">名前</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
              placeholder="山田 太郎"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
              placeholder="you@example.com"
            />
          </div>

          {profileStatus && (
            <p className={`text-sm ${profileStatus.ok ? "text-green-400" : "text-red-400"}`}>
              {profileStatus.msg}
            </p>
          )}

          <Button
            type="submit"
            disabled={profileLoading}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold disabled:opacity-50"
          >
            {profileLoading ? "保存中..." : "保存する"}
          </Button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-1">パスワード変更</h2>
        {!hasPassword ? (
          <p className="text-gray-400 text-sm mt-2">
            このアカウントはソーシャルログイン（Google等）でのみ利用可能です。パスワードは設定されていません。
          </p>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-5">現在のパスワードを確認してから変更できます</p>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">現在のパスワード</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">新しいパスワード</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">新しいパスワード（確認）</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                />
              </div>

              {pwStatus && (
                <p className={`text-sm ${pwStatus.ok ? "text-green-400" : "text-red-400"}`}>
                  {pwStatus.msg}
                </p>
              )}

              <Button
                type="submit"
                disabled={pwLoading}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 disabled:opacity-50"
              >
                {pwLoading ? "変更中..." : "パスワードを変更する"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
