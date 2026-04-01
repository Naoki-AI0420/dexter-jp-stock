export type ChatRole = "user" | "assistant" | "tool";

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export interface ToolCallRecord {
  tool: string;
  args: Record<string, unknown>;
  result: string;
}

export type AgentEvent =
  | { type: "stage"; stage: "planning" | "execution" | "validation" | "response"; message: string }
  | { type: "tool_start"; tool: string; args: Record<string, unknown> }
  | { type: "tool_end"; tool: string; result: string }
  | { type: "message"; content: string }
  | { type: "done"; answer: string; toolCalls: ToolCallRecord[] };
