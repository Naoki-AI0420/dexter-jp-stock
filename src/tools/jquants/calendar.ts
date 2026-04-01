import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { jquantsFetch } from "@/tools/jquants/api";

export const getJPEarningsCalendarTool = new DynamicStructuredTool({
  name: "get_jp_earnings_calendar",
  description: "日本株の決算カレンダーを取得する",
  schema: z.object({
    from: z.string().optional().describe("開始日 YYYY-MM-DD"),
    to: z.string().optional().describe("終了日 YYYY-MM-DD"),
  }),
  func: async ({ from, to }) => {
    const data = await jquantsFetch("/equities/calendar", { from, to }, 60 * 60 * 24);
    return JSON.stringify(data, null, 2);
  },
});
