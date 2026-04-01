"use client";

import { useState } from "react";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessage } from "@/components/chat/chat-message";
import { StockSearch } from "@/components/chat/stock-search";
import { ThinkingIndicator } from "@/components/chat/thinking-indicator";
import { FinancialTable } from "@/components/analysis/financial-table";
import { StockChart } from "@/components/analysis/stock-chart";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface SearchResult {
  code: string;
  companyName: string;
}

export function ChatPanel({
  initialMessages,
  chartData,
  featuredTicker,
}: {
  initialMessages: Message[];
  chartData: Array<{ date: string; close: number }>;
  featuredTicker: SearchResult;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [thinking, setThinking] = useState(false);

  async function handleSubmit(prompt: string) {
    setMessages((current) => [...current, { role: "user", content: prompt }]);
    setThinking(true);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: prompt,
        history: messages,
      }),
    });

    if (!response.body) {
      setThinking(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let answer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      const parts = chunk.split("\n\n").filter(Boolean);
      parts.forEach((part) => {
        const line = part
          .split("\n")
          .find((entry) => entry.startsWith("data: "));
        if (!line) {
          return;
        }
        const payload = JSON.parse(line.slice(6)) as { type: string; content?: string; answer?: string };
        if (payload.type === "message" && payload.content) {
          answer += payload.content;
        }
        if (payload.type === "done" && payload.answer) {
          answer = payload.answer;
        }
      });
    }

    setMessages((current) => [...current, { role: "assistant", content: answer }]);
    setThinking(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <Card className="min-h-[780px]">
        <CardContent className="flex h-full flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-sky-300">AI Analyst</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">日本株版 Dexter</h2>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {messages.map((message, index) => (
              <ChatMessage key={`${message.role}-${index}`} role={message.role} content={message.content} />
            ))}
            {thinking ? <ThinkingIndicator /> : null}
          </div>
          <ChatInput onSubmit={handleSubmit} disabled={thinking} />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Search</p>
              <h3 className="mt-2 text-lg font-semibold text-white">銘柄検索</h3>
            </div>
            <StockSearch />
          </CardContent>
        </Card>
        <StockChart title={`${featuredTicker.companyName} (${featuredTicker.code})`} data={chartData} />
        <FinancialTable
          title="クイックガイド"
          rows={[
            { label: "決算確認", value: "売上 / 営業利益 / ガイダンス" },
            { label: "比較分析", value: "収益性 / 成長率 / バリュエーション" },
            { label: "スクリーニング", value: "PER / PBR / 増収増益" },
          ]}
        />
      </div>
    </div>
  );
}
