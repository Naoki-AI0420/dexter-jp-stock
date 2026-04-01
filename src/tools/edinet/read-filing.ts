import { DynamicStructuredTool } from "@langchain/core/tools";
import JSZip from "jszip";
import { z } from "zod";
import { edinetFetchBinary } from "@/tools/edinet/api";

const accountNameMap: Record<string, string> = {
  NetSales: "売上高",
  Revenue: "売上収益",
  OperatingProfit: "営業利益",
  ProfitLoss: "当期利益",
  Assets: "総資産",
  Equity: "純資産",
};

export function normalizeAccountName(name: string) {
  return accountNameMap[name] ?? name;
}

export async function readEdinetFiling(docId: string) {
  const buffer = await edinetFetchBinary(`/documents/${docId}`, { type: "1" });
  const zip = await JSZip.loadAsync(buffer);
  const xbrlFileName = Object.keys(zip.files).find((fileName) => fileName.endsWith(".xbrl"));
  if (!xbrlFileName) {
    throw new Error("XBRL file was not found in EDINET zip");
  }
  const xml = await zip.files[xbrlFileName].async("text");
  const cleaned = xml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.slice(0, 6000);
}

export const readEdinetFilingTool = new DynamicStructuredTool({
  name: "read_edinet_filing",
  description: "EDINET のXBRL書類を簡易テキスト化して読む",
  schema: z.object({
    docId: z.string().describe("EDINET docID"),
  }),
  func: async ({ docId }) => {
    const text = await readEdinetFiling(docId);
    return text;
  },
});
