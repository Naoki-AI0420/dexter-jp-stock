"use client";

import { useState } from "react";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatInput({
  onSubmit,
  disabled,
}: {
  onSubmit: (value: string) => Promise<void>;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!value.trim()) {
          return;
        }
        const next = value;
        setValue("");
        await onSubmit(next);
      }}
    >
      <Textarea
        value={value}
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
        placeholder="例: トヨタの今期決算どうだった？"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          本サービスは情報提供のみを目的としており、投資助言ではありません。
        </p>
        <Button type="submit" disabled={disabled}>
          <SendHorizonal className="h-4 w-4" />
          送信
        </Button>
      </div>
    </form>
  );
}
