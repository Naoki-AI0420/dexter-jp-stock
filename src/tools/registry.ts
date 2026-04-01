import type { StructuredToolInterface } from "@langchain/core/tools";
import { compareJPStocksTool } from "@/tools/analysis/compare";
import { screenJPStocksTool } from "@/tools/analysis/screen";
import { getEdinetFilingsTool } from "@/tools/edinet/filings";
import { readEdinetFilingTool } from "@/tools/edinet/read-filing";
import { getJPEarningsCalendarTool } from "@/tools/jquants/calendar";
import { getJPCompanyInfoTool } from "@/tools/jquants/company";
import { getJPFinancialsTool } from "@/tools/jquants/financials";
import { getJPStockPriceTool, getJPStockPricesTool } from "@/tools/jquants/stock-price";
import type { RegisteredTool } from "@/tools/types";

const registry: RegisteredTool[] = [
  {
    name: "get_jp_stock_price",
    description: "日本株の最新株価スナップショットを取得",
    tool: getJPStockPriceTool,
  },
  {
    name: "get_jp_stock_prices",
    description: "日本株の株価時系列を取得",
    tool: getJPStockPricesTool,
  },
  {
    name: "get_jp_financials",
    description: "日本株の決算短信・財務指標を取得",
    tool: getJPFinancialsTool,
  },
  {
    name: "get_jp_company_info",
    description: "銘柄コードや会社情報を検索",
    tool: getJPCompanyInfoTool,
  },
  {
    name: "get_jp_earnings_calendar",
    description: "決算予定日を取得",
    tool: getJPEarningsCalendarTool,
  },
  {
    name: "screen_jp_stocks",
    description: "簡易スクリーニング",
    tool: screenJPStocksTool,
  },
  {
    name: "compare_jp_stocks",
    description: "複数銘柄比較",
    tool: compareJPStocksTool,
  },
  {
    name: "get_edinet_filings",
    description: "EDINET 提出書類一覧",
    tool: getEdinetFilingsTool,
  },
  {
    name: "read_edinet_filing",
    description: "EDINET XBRL簡易読解",
    tool: readEdinetFilingTool,
  },
];

export function getToolRegistry() {
  return registry;
}

export function getTools(): StructuredToolInterface[] {
  return registry.map((entry) => entry.tool);
}
