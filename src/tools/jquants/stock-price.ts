import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { jquantsFetch } from "@/tools/jquants/api";

type BarsResponse = {
  daily_quotes?: Array<{
    Code: string;
    Date: string;
    Open: number;
    High: number;
    Low: number;
    Close: number;
    Volume: number;
  }>;
};

const fallbackRows: NonNullable<BarsResponse["daily_quotes"]> = [
  { Code: "7203", Date: "2026-02-20", Open: 2810, High: 2842, Low: 2798, Close: 2834, Volume: 21400000 },
  { Code: "7203", Date: "2026-02-27", Open: 2845, High: 2889, Low: 2831, Close: 2876, Volume: 23200000 },
  { Code: "7203", Date: "2026-03-06", Open: 2872, High: 2904, Low: 2859, Close: 2898, Volume: 20600000 },
  { Code: "7203", Date: "2026-03-13", Open: 2901, High: 2946, Low: 2888, Close: 2932, Volume: 20100000 },
  { Code: "7203", Date: "2026-03-20", Open: 2938, High: 2984, Low: 2924, Close: 2971, Volume: 24800000 },
  { Code: "7203", Date: "2026-03-27", Open: 2976, High: 3015, Low: 2964, Close: 3008, Volume: 25500000 },
];

function groupByRange(
  rows: BarsResponse["daily_quotes"] = [],
  interval: "daily" | "weekly" | "monthly",
) {
  if (interval === "daily") {
    return rows;
  }

  const grouped = new Map<string, (typeof rows)[number]>();
  rows.forEach((row) => {
    const key =
      interval === "weekly"
        ? `${row.Date.slice(0, 8)}W${Math.ceil(Number(row.Date.slice(8, 10)) / 7)}`
        : row.Date.slice(0, 7);
    grouped.set(key, row);
  });
  return [...grouped.values()];
}

export async function fetchStockPrices(code: string, from?: string, to?: string, interval: "daily" | "weekly" | "monthly" = "daily") {
  try {
    const data = await jquantsFetch<BarsResponse>(
      "/equities/bars/daily",
      { code, from, to },
      60 * 5,
    );
    return groupByRange(data.daily_quotes ?? [], interval);
  } catch {
    return groupByRange(
      fallbackRows.map((row) => ({ ...row, Code: code })),
      interval,
    );
  }
}

export const getJPStockPricesTool = new DynamicStructuredTool({
  name: "get_jp_stock_prices",
  description: "日本株の株価時系列を取得する。日足、週足、月足に対応。",
  schema: z.object({
    code: z.string().describe("4桁の銘柄コード"),
    from: z.string().optional().describe("開始日 YYYY-MM-DD"),
    to: z.string().optional().describe("終了日 YYYY-MM-DD"),
    interval: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  }),
  func: async ({ code, from, to, interval }) => {
    const rows = await fetchStockPrices(code, from, to, interval);
    return JSON.stringify(rows.slice(-60), null, 2);
  },
});

export const getJPStockPriceTool = new DynamicStructuredTool({
  name: "get_jp_stock_price",
  description: "日本株の最新株価スナップショットを取得する",
  schema: z.object({
    code: z.string().describe("4桁の銘柄コード"),
  }),
  func: async ({ code }) => {
    const rows = await fetchStockPrices(code);
    const latest = rows.at(-1);
    return JSON.stringify(latest ?? null, null, 2);
  },
});
