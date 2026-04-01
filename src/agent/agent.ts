import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { compactHistory } from "@/agent/compact";
import { buildPlanningPrompt, buildValidationPrompt, DEXTER_SYSTEM_PROMPT, INVESTMENT_DISCLAIMER } from "@/agent/prompts";
import type { AgentEvent, ChatTurn, ToolCallRecord } from "@/agent/types";
import { getDefaultModel } from "@/model/llm";
import { getToolRegistry, getTools } from "@/tools/registry";

function serializeHistory(history: ChatTurn[]) {
  return compactHistory(history)
    .map((turn) => `${turn.role}: ${turn.content}`)
    .join("\n");
}

function summarizeToolCalls(toolCalls: ToolCallRecord[]) {
  return toolCalls
    .map((call) => `${call.tool}(${JSON.stringify(call.args)}): ${call.result}`)
    .join("\n\n");
}

function inferStarterTool(query: string) {
  if (/比較|vs|どっち/i.test(query)) {
    return "compare_jp_stocks";
  }
  if (/スクリーニング|PER|PBR|配当/i.test(query)) {
    return "screen_jp_stocks";
  }
  if (/有報|有価証券報告書|EDINET/i.test(query)) {
    return "get_edinet_filings";
  }
  if (/株価|チャート|推移/i.test(query)) {
    return "get_jp_stock_prices";
  }
  if (/会社|企業|銘柄コード/i.test(query)) {
    return "get_jp_company_info";
  }
  return "get_jp_financials";
}

export class DexterJpAgent {
  async *run(query: string, history: ChatTurn[] = []): AsyncGenerator<AgentEvent> {
    const model = getDefaultModel();
    const tools = getTools();
    const registry = new Map(getToolRegistry().map((tool) => [tool.name, tool.tool]));
    const boundModel = model.bindTools(tools);

    yield {
      type: "stage",
      stage: "planning",
      message: "質問を分解し、必要なデータ取得計画を作成しています。",
    };

    const historyText = serializeHistory(history);
    const planning = await model.invoke([
      new SystemMessage(DEXTER_SYSTEM_PROMPT),
      new HumanMessage(buildPlanningPrompt(query, historyText)),
    ]);

    yield { type: "message", content: String(planning.content) };
    yield {
      type: "stage",
      stage: "execution",
      message: "計画に沿ってJ-Quants / EDINETのデータを取得しています。",
    };

    const messages = [
      new SystemMessage(DEXTER_SYSTEM_PROMPT),
      ...compactHistory(history).map((turn) =>
        turn.role === "user" ? new HumanMessage(turn.content) : new AIMessage(turn.content),
      ),
      new HumanMessage(`分析を開始してください。優先ツール候補: ${inferStarterTool(query)}\n質問: ${query}`),
    ];

    const toolCalls: ToolCallRecord[] = [];
    let finalAnswer = "";

    for (let i = 0; i < 6; i += 1) {
      const response = await boundModel.invoke(messages);
      messages.push(response);
      if (!response.tool_calls?.length) {
        finalAnswer = String(response.content);
        break;
      }

      for (const call of response.tool_calls) {
        const tool = registry.get(call.name);
        if (!tool) {
          continue;
        }

        yield { type: "tool_start", tool: call.name, args: call.args };
        const result = await tool.invoke(call.args);
        const stringResult = typeof result === "string" ? result : JSON.stringify(result);
        toolCalls.push({ tool: call.name, args: call.args, result: stringResult });
        messages.push(
          new ToolMessage({
            tool_call_id: call.id ?? call.name,
            content: stringResult,
            name: call.name,
          }),
        );
        yield { type: "tool_end", tool: call.name, result: stringResult };
      }
    }

    yield {
      type: "stage",
      stage: "validation",
      message: "取得データと回答の整合性を確認しています。",
    };

    const toolSummary = summarizeToolCalls(toolCalls);
    const validation = await model.invoke([
      new SystemMessage(DEXTER_SYSTEM_PROMPT),
      new HumanMessage(buildValidationPrompt(finalAnswer, toolSummary)),
    ]);

    yield {
      type: "stage",
      stage: "response",
      message: "最終回答を整えています。",
    };

    if (String(validation.content).trim() !== "OK") {
      finalAnswer = `${finalAnswer}\n\n確認メモ:\n${validation.content}`;
    }

    if (!finalAnswer.includes(INVESTMENT_DISCLAIMER)) {
      finalAnswer = `${finalAnswer}\n\n${INVESTMENT_DISCLAIMER}`;
    }

    yield { type: "done", answer: finalAnswer, toolCalls };
  }
}
