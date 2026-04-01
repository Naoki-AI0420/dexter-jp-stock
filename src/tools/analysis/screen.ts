import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { searchCompanies } from "@/tools/jquants/company";
import { fetchFinancials } from "@/tools/jquants/financials";

export const screenJPStocksTool = new DynamicStructuredTool({
  name: "screen_jp_stocks",
  description: "日本株を簡易条件でスクリーニングする",
  schema: z.object({
    keyword: z.string().default("").describe("業種や会社名のフィルタ"),
    minProfitMargin: z.number().optional().describe("最低営業利益率"),
  }),
  func: async ({ keyword, minProfitMargin }) => {
    const companies = await searchCompanies(keyword || "ト");
    const analyzed = await Promise.all(
      companies.slice(0, 5).map(async (company) => {
        const rows = await fetchFinancials(company.code);
        const latest = (rows[0] ?? {}) as Record<string, string | number | null>;
        const margin = Number(latest.OperatingProfitMargin ?? latest.ProfitMargin ?? 0);
        return { ...company, operatingProfitMargin: margin };
      }),
    );

    return JSON.stringify(
      analyzed.filter((row) =>
        minProfitMargin === undefined ? true : row.operatingProfitMargin >= minProfitMargin,
      ),
      null,
      2,
    );
  },
});
