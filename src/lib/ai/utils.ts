import type { CallSettings, Prompt } from "@/types/ai";
import { ModelName } from "@/lib/ai/models";

export function prepareTextPrompt<P extends string>(
  props: CallSettings & Prompt<P>
) {
  const { model, prompt, temperature = 0.7, maxTokens, systemPrompt } = props;

  return {
    model,
    temperature,
    maxTokens,
    messages: [
      systemPrompt
        ? { role: "system" as const, content: systemPrompt }
        : undefined,
      { role: "user" as const, content: prompt },
    ].filter(Boolean),
  };
}