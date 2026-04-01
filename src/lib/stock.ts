import { fetchStockPrices } from "@/tools/jquants/stock-price";

export async function getChartData(code: string) {
  try {
    const rows = await fetchStockPrices(code, undefined, undefined, "daily");
    return rows.slice(-30).map((row) => ({
      date: row.Date,
      close: row.Close,
      volume: row.Volume,
    }));
  } catch {
    return [];
  }
}
