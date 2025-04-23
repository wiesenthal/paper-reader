import type { ModelName } from "@/lib/ai/models";

export type CallSettings = {
  model: ModelName;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
};

export type Prompt<P extends string> = {
  prompt: P;
};
