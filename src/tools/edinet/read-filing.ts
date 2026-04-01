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

export interface FilingSections {
  /** 事業の概況 */
  overview?: string;
  /** リスク要因（センテンスリスト） */
  risks?: string[];
  /** 経営方針・戦略 */
  management?: string;
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
  const cleaned = xml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.slice(0, 6000);
}

/**
 * Extended version that returns structured sections for richer analysis.
 */
export async function readEdinetFilingWithSections(docId: string): Promise<FilingSections> {
  const buffer = await edinetFetchBinary(`/documents/${docId}`, { type: "1" });
  const zip = await JSZip.loadAsync(buffer);
  const xbrlFileName = Object.keys(zip.files).find((f) => f.endsWith(".xbrl"));
  if (!xbrlFileName) {
    throw new Error("XBRL file was not found in EDINET zip");
  }
  const xml = await zip.files[xbrlFileName].async("text");

  // Raw text fallback
  const cleaned = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const sections: FilingSections = {
    raw: cleaned.slice(0, 2000),
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
  if (managementText) sections.management = managementText;

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
  if (s.management) {
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
  }),
  func: async ({ docId, sectionsOnly }) => {
    if (sectionsOnly) {
      const sections = await readEdinetFilingWithSections(docId);
      return formatSections(sections);
    }
    return readEdinetFiling(docId);
  },
});
