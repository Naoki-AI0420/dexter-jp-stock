"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState(session?.user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const body: Record<string, string> = { name };
    if (newPassword) {
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }

    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json() as { error?: string; name?: string };

    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "更新に失敗しました" });
    } else {
      await update({ name: data.name });
      setCurrentPassword("");
      setNewPassword("");
      setMessage({ type: "success", text: "プロフィールを更新しました" });
    }

    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch("/api/user/profile", { method: "DELETE" });
    if (res.ok) {
      router.push("/");
    } else {
      setMessage({ type: "error", text: "アカウント削除に失敗しました" });
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-4 py-4 flex items-center justify-between sm:px-6">
        <Link href="/" className="text-xl font-bold">Dexter</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/settings/billing" className="text-gray-400 hover:text-white">プラン・請求</Link>
          <Link href="/dashboard" className="text-gray-400 hover:text-white">← ダッシュボード</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-bold mb-2">アカウント設定</h1>
        <p className="text-gray-400 text-sm mb-8">プロフィール情報とパスワードを管理します</p>

        {message && (
          <div
            className={`mb-6 rounded-lg px-4 py-3 text-sm ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/30 text-green-300"
                : "bg-red-500/10 border border-red-500/30 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-5">プロフィール</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">メールアドレス</label>
              <p className="text-sm text-gray-300 py-2">{session?.user?.email}</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm text-gray-400 mb-1">
                表示名
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none"
                placeholder="お名前"
                maxLength={100}
              />
            </div>

            <hr className="border-gray-800 my-4" />
            <p className="text-sm font-medium text-gray-300">パスワード変更</p>

            <div>
              <label htmlFor="currentPassword" className="block text-sm text-gray-400 mb-1">
                現在のパスワード
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none"
                placeholder="変更する場合のみ入力"
                autoComplete="current-password"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm text-gray-400 mb-1">
                新しいパスワード
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none"
                placeholder="8文字以上"
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={saving} className="bg-sky-600 hover:bg-sky-500 text-white text-sm">
                {saving ? "保存中…" : "変更を保存"}
              </Button>
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-gray-900 border border-red-900/40 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-400 mb-3">危険ゾーン</h2>
          <p className="text-sm text-gray-400 mb-4">
            アカウントを削除すると、全てのデータ（チャット履歴・ウォッチリスト・分析ログ）が完全に削除されます。
            この操作は取り消せません。
          </p>
          {!showDeleteConfirm ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="border-red-800 text-red-400 hover:border-red-600 hover:text-red-300 text-sm"
            >
              アカウントを削除
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-300 font-medium">本当に削除しますか？この操作は取り消せません。</p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="bg-red-700 hover:bg-red-600 text-white text-sm"
                >
                  {deleting ? "削除中…" : "はい、削除します"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border-gray-700 text-gray-400 text-sm"
                >
                  キャンセル
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
