import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { fetchFinancials } from "@/tools/jquants/financials";
import { fetchStockPrices } from "@/tools/jquants/stock-price";

export const compareJPStocksTool = new DynamicStructuredTool({
  name: "compare_jp_stocks",
  description: "複数銘柄の株価と主要財務指標を比較する",
  schema: z.object({
    codes: z.array(z.string()).min(2).max(4).describe("比較する4桁コードの配列"),
  }),
  func: async ({ codes }) => {
    const result = await Promise.all(
      codes.map(async (code) => {
        const prices = await fetchStockPrices(code);
        const latestPrice = prices.at(-1);
        const financials = await fetchFinancials(code);
        const latestFinancial = (financials[0] ?? {}) as Record<string, string | number | null>;
        return {
          code,
          latestClose: latestPrice?.Close ?? null,
          latestDate: latestPrice?.Date ?? null,
          revenue: latestFinancial.NetSales ?? latestFinancial.Revenue ?? null,
          operatingProfit: latestFinancial.OperatingProfit ?? null,
          profitMargin: latestFinancial.OperatingProfitMargin ?? latestFinancial.ProfitMargin ?? null,
        };
      }),
    );
    return JSON.stringify(result, null, 2);
  },
});
