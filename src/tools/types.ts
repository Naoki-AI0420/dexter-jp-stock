import type { StructuredToolInterface } from "@langchain/core/tools";

export interface RegisteredTool {
  name: string;
  description: string;
  tool: StructuredToolInterface;
}
