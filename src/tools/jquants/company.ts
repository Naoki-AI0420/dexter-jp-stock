import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { jquantsFetch } from "@/tools/jquants/api";

const fallbackCompanies = [
  { code: "7203", companyName: "トヨタ自動車", sector17CodeName: "輸送用機器", marketCodeName: "プライム" },
  { code: "6758", companyName: "ソニーグループ", sector17CodeName: "電気機器", marketCodeName: "プライム" },
  { code: "6501", companyName: "日立製作所", sector17CodeName: "電気機器", marketCodeName: "プライム" },
];

export async function searchCompanies(keyword: string) {
  try {
    const data = await jquantsFetch<{ info?: Array<Record<string, string>> }>(
      "/equities/info",
      {},
      60 * 60 * 24,
    );
    const companies = data.info ?? [];
    return companies
      .filter((company) =>
        [company.Code, company.CompanyName, company.CompanyNameEnglish]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(keyword.toLowerCase())),
      )
      .slice(0, 10)
      .map((company) => ({
        code: company.Code,
        companyName: company.CompanyName,
        market: company.MarketCodeName,
        sector: company.Sector17CodeName,
      }));
  } catch {
    return fallbackCompanies.filter((company) =>
      [company.code, company.companyName].some((value) => value.includes(keyword)),
    );
  }
}

export const getJPCompanyInfoTool = new DynamicStructuredTool({
  name: "get_jp_company_info",
  description: "日本株の銘柄コード、会社名、市場区分、業種を取得する",
  schema: z.object({
    keyword: z.string().describe("銘柄コードまたは会社名の一部"),
  }),
  func: async ({ keyword }) => {
    const companies = await searchCompanies(keyword);
    return JSON.stringify(companies, null, 2);
  },
});
