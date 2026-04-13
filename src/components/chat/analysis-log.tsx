"use client";

import { useState } from "react";
import type { ToolCallRecord } from "@/agent/types";

interface AnalysisLogProps {
  toolCalls: ToolCallRecord[];
  onSave?: (content: string, toolCalls: ToolCallRecord[]) => Promise<void>;
}

export function AnalysisLog({ toolCalls, onSave }: AnalysisLogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (toolCalls.length === 0) return null;

  async function handleSave() {
    if (!onSave) return;
    setSaving(true);
    const summary = toolCalls
      .map((tc) => `[${tc.tool}]\n引数: ${JSON.stringify(tc.args)}\n結果: ${tc.result.slice(0, 300)}`)
      .join("\n\n---\n\n");
    await onSave(summary, toolCalls);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mt-2 rounded-lg border border-gray-700 bg-gray-900/60 text-xs">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left text-gray-400 hover:text-gray-200"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center gap-1.5">
          <span className="font-mono text-sky-400">●</span>
          分析ログ（ツール実行 {toolCalls.length}件）
        </span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-gray-700 px-3 py-2 space-y-3">
          {toolCalls.map((tc, i) => (
            <div key={i} className="space-y-1">
              <p className="font-mono text-amber-400">{i + 1}. {tc.tool}</p>
              <p className="text-gray-500">
                引数: <span className="text-gray-300">{JSON.stringify(tc.args)}</span>
              </p>
              <p className="text-gray-500">
                結果:{" "}
                <span className="text-gray-300 break-all">
                  {tc.result.length > 200 ? `${tc.result.slice(0, 200)}…` : tc.result}
                </span>
              </p>
            </div>
          ))}

          {onSave && (
            <button
              type="button"
              disabled={saving || saved}
              onClick={handleSave}
              className="mt-2 rounded bg-sky-700 px-3 py-1 text-white hover:bg-sky-600 disabled:opacity-50"
            >
              {saved ? "保存済み ✓" : saving ? "保存中…" : "スクラッチパッドに保存"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
