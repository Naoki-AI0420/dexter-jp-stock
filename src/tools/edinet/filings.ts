import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { edinetFetchJson } from "@/tools/edinet/api";

export async function getEdinetFilings(date: string) {
  const data = await edinetFetchJson<{ results?: unknown[] }>("/documents.json", {
    date,
    type: "2",
  });
  return data.results ?? [];
}

export const getEdinetFilingsTool = new DynamicStructuredTool({
  name: "get_edinet_filings",
  description: "EDINET の提出書類一覧を取得する",
  schema: z.object({
    date: z.string().describe("対象日 YYYY-MM-DD"),
  }),
  func: async ({ date }) => {
    const filings = await getEdinetFilings(date);
    return JSON.stringify(filings.slice(0, 20), null, 2);
  },
});
