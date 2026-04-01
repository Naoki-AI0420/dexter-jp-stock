import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";

export function getDefaultModel() {
  const provider = process.env.DEFAULT_LLM_PROVIDER ?? "openai";
  const model = process.env.DEFAULT_LLM_MODEL ?? "gpt-4.1-mini";

  if (provider === "anthropic") {
    return new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      model,
      temperature: 0.2,
    });
  }

  return new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model,
    temperature: 0.2,
  });
}
