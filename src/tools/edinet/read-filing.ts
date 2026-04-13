import { DynamicStructuredTool } from "@langchain/core/tools";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import JSZip from "jszip";
import { z } from "zod";
import { edinetFetchBinary } from "@/tools/edinet/api";
import { getDefaultModel } from "@/model/llm";

// JP GAAP / IFRS account name normalization map
// JP GAAP items (jpcrp / jppfs namespace), IFRS items (ifrs namespace)
const accountNameMap: Record<string, string> = {
  // --- 損益計算書 (P/L) ---
  NetSales: "売上高",
  Revenue: "売上収益",
  NetRevenue: "純収益",
  GrossSales: "総売上高",
  SalesOfGoods: "商品売上高",
  NetSalesOfGoods: "商品純売上高",
  CostOfSales: "売上原価",
  CostOfGoodsSold: "売上原価",
  GrossProfit: "売上総利益",
  GrossProfitLoss: "売上総損益",
  SellingGeneralAndAdministrativeExpenses: "販売費及び一般管理費",
  SellingExpenses: "販売費",
  GeneralAndAdministrativeExpenses: "一般管理費",
  OperatingProfit: "営業利益",
  OperatingLoss: "営業損失",
  OperatingIncomeLoss: "営業損益",
  OperatingIncome: "営業利益",
  ProfitLossFromOperatingActivities: "営業活動損益",
  NonOperatingIncome: "営業外収益",
  NonOperatingExpenses: "営業外費用",
  OrdinaryIncome: "経常利益",
  OrdinaryLoss: "経常損失",
  OrdinaryIncomeLoss: "経常損益",
  ExtraordinaryIncome: "特別利益",
  ExtraordinaryLoss: "特別損失",
  IncomeBeforeIncomeTaxes: "税引前当期純利益",
  ProfitLossBeforeTax: "税引前利益",
  IncomeTaxes: "法人税等",
  IncomeTaxesCurrent: "法人税等（当期）",
  IncomeTaxesDeferred: "法人税等（繰延）",
  ProfitLoss: "当期利益",
  NetIncomeLoss: "当期純損益",
  NetIncome: "当期純利益",
  NetLoss: "当期純損失",
  ProfitLossAttributableToOwnersOfParent: "親会社株主帰属純利益",
  ProfitLossAttributableToNonControllingInterests: "非支配株主帰属純利益",
  EarningsPerShare: "1株当たり純利益（EPS）",
  DilutedEarningsPerShare: "希薄化後EPS",
  ComprehensiveIncome: "包括利益",
  OtherComprehensiveIncome: "その他包括利益",

  // --- 貸借対照表 (B/S) ---
  Assets: "総資産",
  TotalAssets: "総資産",
  CurrentAssets: "流動資産",
  NonCurrentAssets: "非流動資産",
  NoncurrentAssets: "固定資産",
  Cash: "現金",
  CashAndCashEquivalents: "現金及び現金同等物",
  CashAndDeposits: "現金及び預金",
  TradeReceivables: "売掛金",
  TradeAndOtherReceivables: "売掛金・その他債権",
  NotesAndAccountsReceivable: "受取手形及び売掛金",
  Inventories: "棚卸資産",
  OtherCurrentAssets: "その他流動資産",
  PropertyPlantAndEquipment: "有形固定資産",
  PropertyPlantAndEquipmentNet: "有形固定資産（純額）",
  IntangibleAssets: "無形固定資産",
  Goodwill: "のれん",
  InvestmentSecurities: "投資有価証券",
  DeferredTaxAssets: "繰延税金資産",
  Liabilities: "総負債",
  TotalLiabilities: "総負債",
  CurrentLiabilities: "流動負債",
  NonCurrentLiabilities: "非流動負債",
  NoncurrentLiabilities: "固定負債",
  TradePayables: "買掛金",
  NotesAndAccountsPayable: "支払手形及び買掛金",
  ShortTermBorrowings: "短期借入金",
  LongTermBorrowings: "長期借入金",
  BondsPayable: "社債",
  DeferredTaxLiabilities: "繰延税金負債",
  RetirementBenefitLiability: "退職給付に係る負債",
  Equity: "純資産",
  TotalEquity: "純資産合計",
  ShareholdersEquity: "株主資本",
  CommonStock: "資本金",
  CapitalSurplus: "資本剰余金",
  RetainedEarnings: "利益剰余金",
  RetainedEarningsAccumulatedDeficit: "繰越利益剰余金",
  TreasuryStock: "自己株式",
  NonControllingInterests: "非支配株主持分",
  AccumulatedOtherComprehensiveIncome: "その他包括利益累計額",

  // --- キャッシュフロー計算書 (C/F) ---
  CashFlowsFromOperatingActivities: "営業活動CF",
  NetCashProvidedByUsedInOperatingActivities: "営業活動CF（純額）",
  CashFlowsFromInvestingActivities: "投資活動CF",
  NetCashProvidedByUsedInInvestingActivities: "投資活動CF（純額）",
  CashFlowsFromFinancingActivities: "財務活動CF",
  NetCashProvidedByUsedInFinancingActivities: "財務活動CF（純額）",
  FreeCashFlow: "フリーCF",
  CapitalExpenditures: "設備投資",
  Depreciation: "減価償却費",
  DepreciationAndAmortization: "減価償却費・償却費",
  Amortization: "償却費",

  // --- セグメント情報 ---
  SegmentRevenue: "セグメント売上",
  SegmentProfit: "セグメント利益",
  SegmentAssets: "セグメント資産",

  // --- 引当金・準備金 ---
  AllowanceForDoubtfulAccounts: "貸倒引当金",
  WarrantyReserve: "製品保証引当金",
  RetirementBenefitObligation: "退職給付債務",
  LegalReserve: "利益準備金",
  VoluntaryReserves: "任意積立金",

  // --- 1株当たり情報 ---
  BookValuePerShare: "1株当たり純資産（BPS）",
  DividendPerShare: "1株当たり配当金（DPS）",
  NetAssetsPerShare: "1株当たり純資産",
};

export function normalizeAccountName(name: string) {
  return accountNameMap[name] ?? name;
}

// XBRL element names that typically contain each section
const SECTION_ELEMENTS: Record<string, string[]> = {
  overview: [
    "BusinessOverview",
    "DescriptionOfBusiness",
    "CompanyOverview",
    "BusinessDescription",
  ],
  risks: [
    "BusinessRisks",
    "RiskFactors",
    "SignificantRisksAndUncertainties",
    "RiskInformation",
  ],
  management: [
    "ManagementPolicy",
    "ManagementStrategies",
    "ManagementGoalsAndStrategies",
  ],
  financials: [
    "NotesToFinancialStatements",
    "FinancialStatementsEtc",
    "ConsolidatedStatementOfIncome",
  ],
};

// Sentence-level patterns that indicate risk content
const RISK_SENTENCE_PATTERNS = [
  /リスク[はがのに]/,
  /懸念[はがされ]/,
  /悪化[するした]/,
  /減少する可能性/,
  /損失[がを]/,
  /影響を受け/,
  /不確実[性な]/,
  /低下[するした]/,
  /競争が激化/,
  /規制[のを][変強]/,
];

/**
 * Extract individual account line items from XBRL, normalizing element names
 * using the accountNameMap (JP GAAP / IFRS normalization).
 * Returns a formatted string like "売上高: 1,234,567\n営業利益: 123,456\n..."
 */
export function extractAccountMetrics(xml: string, maxItems = 20): string {
  const results: Array<{ label: string; value: string }> = [];
  const seen = new Set<string>();

  // Match elements like <jpcrp:NetSales contextRef="...">12345</jpcrp:NetSales>
  const elemRegex = /<(?:[A-Za-z0-9_-]+:)?([A-Za-z][A-Za-z0-9]+)\s[^>]*contextRef="[^"]*"[^>]*>([-\d,.+]+)<\/(?:[A-Za-z0-9_-]+:)?\1>/g;
  let match: RegExpExecArray | null;

  while ((match = elemRegex.exec(xml)) !== null && results.length < maxItems) {
    const elementName = match[1];
    const value = match[2];
    const normalized = normalizeAccountName(elementName);
    // Skip if element name is unchanged (not in our map) or already seen
    if (normalized === elementName || seen.has(normalized)) continue;
    seen.add(normalized);
    const numValue = Number(value.replace(/,/g, ""));
    if (Number.isNaN(numValue)) continue;
    const formatted = Number.isInteger(numValue)
      ? numValue.toLocaleString("ja-JP")
      : numValue.toFixed(2);
    results.push({ label: normalized, value: formatted });
  }

  if (results.length === 0) return "";
  return results.map(r => `${r.label}: ${r.value}`).join("\n");
}

/**
 * Extract the text content of a named XBRL element from raw XML.
 * Handles both namespaced (<ns:Element>) and bare (<Element>) tags.
 */
function extractSection(xml: string, elementNames: string[]): string | undefined {
  for (const name of elementNames) {
    const regex = new RegExp(
      `<(?:[A-Za-z0-9_-]+:)?${name}[^>]*>([\\s\\S]{20,15000}?)<\\/(?:[A-Za-z0-9_-]+:)?${name}>`,
      "i",
    );
    const match = xml.match(regex);
    if (match?.[1]) {
      return match[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 2500);
    }
  }
  return undefined;
}

/**
 * Extract risk-related sentences from a block of text.
 */
function extractRiskSentences(text: string): string[] {
  const sentences = text
    .split(/[。\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 15);
  return sentences
    .filter(s => RISK_SENTENCE_PATTERNS.some(p => p.test(s)))
    .slice(0, 12);
}

/**
 * Summarize the management strategy section using LLM.
 * Returns a structured summary with long-term goals, key strategies,
 * competitive positioning, and risk-strategy linkage.
 */
export async function summarizeManagementStrategy(rawText: string): Promise<string> {
  const model = getDefaultModel();
  const prompt = `以下は有価証券報告書から抽出した「経営方針・事業戦略」セクションです。
投資家向けに日本語で以下の観点を含む簡潔な要約（300〜500字）を作成してください：
1. 長期目標・ビジョン
2. 主要な経営戦略・施策
3. 競争優位性・差別化ポイント
4. 課題・リスクと対応方針

テキスト：
${rawText.slice(0, 2000)}

要約（箇条書き形式）：`;

  const result = await model.invoke([
    new SystemMessage("あなたは日本株の財務アナリストです。有価証券報告書の経営方針セクションを投資家向けに要約します。"),
    new HumanMessage(prompt),
  ]);

  return String(result.content).trim();
}

export interface FilingSections {
  /** 事業の概況 */
  overview?: string;
  /** リスク要因（センテンスリスト） */
  risks?: string[];
  /** 経営方針・戦略（生テキスト） */
  management?: string;
  /** 経営方針・戦略（LLM要約） */
  managementSummary?: string;
  /** 財務諸表サマリー */
  financials?: string;
  /** 生テキスト先頭2000文字 */
  raw: string;
}

/**
 * Download and parse an EDINET filing, returning both raw text and
 * structured sections (overview, risks, management, financials).
 */
export async function readEdinetFiling(docId: string): Promise<string> {
  const buffer = await edinetFetchBinary(`/documents/${docId}`, { type: "1" });
  const zip = await JSZip.loadAsync(buffer);
  const xbrlFileName = Object.keys(zip.files).find((fileName) => fileName.endsWith(".xbrl"));
  if (!xbrlFileName) {
    throw new Error("XBRL file was not found in EDINET zip");
  }
  const xml = await zip.files[xbrlFileName].async("text");

  // Extract normalized account metrics before stripping tags
  const metrics = extractAccountMetrics(xml);
  const cleaned = xml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const rawText = cleaned.slice(0, 5500);
  return metrics ? `## 主要勘定科目\n${metrics}\n\n## 書類テキスト\n${rawText}` : rawText;
}

/**
 * Extended version that returns structured sections for richer analysis.
 * Pass summarize=true to include LLM-generated management strategy summary.
 */
export async function readEdinetFilingWithSections(docId: string, summarize = false): Promise<FilingSections> {
  const buffer = await edinetFetchBinary(`/documents/${docId}`, { type: "1" });
  const zip = await JSZip.loadAsync(buffer);
  const xbrlFileName = Object.keys(zip.files).find((f) => f.endsWith(".xbrl"));
  if (!xbrlFileName) {
    throw new Error("XBRL file was not found in EDINET zip");
  }
  const xml = await zip.files[xbrlFileName].async("text");

  // Raw text fallback
  const cleaned = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const accountMetrics = extractAccountMetrics(xml);
  const sections: FilingSections = {
    raw: accountMetrics ? `## 主要勘定科目\n${accountMetrics}\n\n${cleaned.slice(0, 1500)}` : cleaned.slice(0, 2000),
  };

  // Extract each section
  const overviewText = extractSection(xml, SECTION_ELEMENTS.overview);
  if (overviewText) sections.overview = overviewText;

  const risksText = extractSection(xml, SECTION_ELEMENTS.risks);
  if (risksText) {
    sections.risks = extractRiskSentences(risksText);
    // If pattern-based extraction yielded nothing, fall back to raw excerpt
    if (sections.risks.length === 0) {
      sections.risks = [risksText.slice(0, 1000)];
    }
  } else {
    // Try heuristic: scan raw text for risk sentences
    const heuristic = extractRiskSentences(cleaned);
    if (heuristic.length > 0) sections.risks = heuristic;
  }

  const managementText = extractSection(xml, SECTION_ELEMENTS.management);
  if (managementText) {
    sections.management = managementText;
    if (summarize) {
      sections.managementSummary = await summarizeManagementStrategy(managementText);
    }
  }

  const financialsText = extractSection(xml, SECTION_ELEMENTS.financials);
  if (financialsText) sections.financials = financialsText;

  return sections;
}

/** Format FilingSections into a human-readable string for the LLM. */
function formatSections(s: FilingSections): string {
  const parts: string[] = [];

  if (s.overview) {
    parts.push(`## 事業の概況\n${s.overview}`);
  }
  if (s.risks && s.risks.length > 0) {
    parts.push(`## リスク要因\n${s.risks.map((r, i) => `${i + 1}. ${r}`).join("\n")}`);
  }
  if (s.managementSummary) {
    parts.push(`## 経営方針・戦略（要約）\n${s.managementSummary}`);
  } else if (s.management) {
    parts.push(`## 経営方針・戦略\n${s.management}`);
  }
  if (s.financials) {
    parts.push(`## 財務情報\n${s.financials}`);
  }
  if (parts.length === 0) {
    parts.push(`## 書類テキスト（先頭）\n${s.raw}`);
  }
  return parts.join("\n\n");
}

export const readEdinetFilingTool = new DynamicStructuredTool({
  name: "read_edinet_filing",
  description:
    "EDINETのXBRL書類を取得し、事業概況・リスク要因・経営方針・財務情報をセクション別に抽出して返す",
  schema: z.object({
    docId: z.string().describe("EDINET docID"),
    sectionsOnly: z
      .boolean()
      .optional()
      .describe("trueのときセクション分割テキスト、falseまたは未指定でフルテキスト先頭6000文字"),
    summarizeStrategy: z
      .boolean()
      .optional()
      .describe("trueのとき経営方針セクションをLLMで要約する（sectionsOnly=trueと併用）"),
  }),
  func: async ({ docId, sectionsOnly, summarizeStrategy }) => {
    if (sectionsOnly) {
      const sections = await readEdinetFilingWithSections(docId, summarizeStrategy ?? false);
      return formatSections(sections);
    }
    return readEdinetFiling(docId);
  },
});
