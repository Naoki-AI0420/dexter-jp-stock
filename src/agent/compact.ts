import type { ChatTurn } from "@/agent/types";

export function compactHistory(history: ChatTurn[], maxTurns = 8) {
  if (history.length <= maxTurns) {
    return history;
  }
  return history.slice(history.length - maxTurns);
}
