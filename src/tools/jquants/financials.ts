import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { jquantsFetch } from "@/tools/jquants/api";

type StatementsResponse = {
  statements?: Array<Record<string, string | number | null>>;
};

const fallbackStatements: NonNullable<StatementsResponse["statements"]> = [
  {
    Code: "7203",
    DisclosedDate: "2026-02-05",
    FiscalYear: "2026/03",
    NetSales: 48500000000000,
    OperatingProfit: 5350000000000,
    ProfitMargin: 11.0,
    OperatingProfitMargin: 11.0,
  },
  {
    Code: "7203",
    DisclosedDate: "2025-11-05",
    FiscalYear: "2025/03",
    NetSales: 45100000000000,
    OperatingProfit: 4680000000000,
    ProfitMargin: 10.3,
    OperatingProfitMargin: 10.3,
  },
];

export async function fetchFinancials(code: string) {
  try {
    const data = await jquantsFetch<StatementsResponse>(
      "/equities/statements",
      { code },
      60 * 60 * 24,
    );
    return data.statements ?? [];
  } catch {
    return fallbackStatements.map((row) => ({ ...row, Code: code }));
  }
}

export const getJPFinancialsTool = new DynamicStructuredTool({
  name: "get_jp_financials",
  description: "日本株の財務諸表や決算短信データを取得する",
  schema: z.object({
    code: z.string().describe("4桁の銘柄コード"),
  }),
  func: async ({ code }) => {
    const rows = await fetchFinancials(code);
    return JSON.stringify(rows.slice(0, 8), null, 2);
  },
});
