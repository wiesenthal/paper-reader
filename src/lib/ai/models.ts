import { anthropic } from "@ai-sdk/anthropic";
import { cerebras } from "@ai-sdk/cerebras";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel, LanguageModelUsage } from "ai";

export const modelNames = [
  "gpt-4o",
  "gpt-4o-mini",
  "claude-3-opus",
  "claude-3-sonnet",
  "claude-3-haiku",
  "claude-3-5-haiku",
  "claude-3-5-sonnet",
  "claude-3-7-sonnet",
  "o3-mini",
  "o3",
  "cerebras-llama-3-8b",
  "cerebras-llama-3-70b",
] as const;

export type ModelName = (typeof modelNames)[number];

export const models: Record<ModelName, LanguageModel> = {
  "gpt-4o": openai("gpt-4o"),
  "gpt-4o-mini": openai("gpt-4o-mini"),
  "claude-3-opus": anthropic("claude-3-opus-20240229"),
  "claude-3-sonnet": anthropic("claude-3-sonnet-20240229"),
  "claude-3-haiku": anthropic("claude-3-haiku-20240307"),
  "claude-3-5-haiku": anthropic("claude-3-5-haiku-20241022"),
  "claude-3-5-sonnet": anthropic("claude-3-5-sonnet-20241022"),
  "claude-3-7-sonnet": anthropic("claude-3-7-sonnet-20250219"),
  "o3-mini": openai("o3-mini"),
  o3: openai("o3"),
  "cerebras-llama-3-8b": cerebras("llama3.1-8b"),
  "cerebras-llama-3-70b": cerebras("llama-3.3-70b"),
} as const;

// Pricing per token for various models (as of 2024-08-06)
export const pricing: Record<
  ModelName,
  { prompt: number; completion: number }
> = {
  "claude-3-5-sonnet": {
    prompt: 0.000003,
    completion: 0.000015,
  },
  "gpt-4o": {
    prompt: 0.0000025,
    completion: 0.00001,
  },
  "gpt-4o-mini": {
    prompt: 0.00000015,
    completion: 0.0000006,
  },
  "claude-3-opus": {
    prompt: 0.000015,
    completion: 0.000075,
  },
  "claude-3-sonnet": {
    prompt: 0.000003,
    completion: 0.000015,
  },
  "claude-3-haiku": {
    prompt: 0.00000025,
    completion: 0.00000125,
  },
  "claude-3-5-haiku": {
    prompt: 0.0000008,
    completion: 0.000004,
  },
  "claude-3-7-sonnet": {
    prompt: 0.000003,
    completion: 0.000015,
  },
  "o3-mini": {
    prompt: 0.0000011,
    completion: 0.0000011,
  },
  o3: {
    prompt: 10 / 1_000_000,
    completion: 40 / 1_000_000,
  },
  "cerebras-llama-3-8b": {
    prompt: 0,
    completion: 0,
  },
  "cerebras-llama-3-70b": {
    prompt: 0,
    completion: 0,
  },
};

export function calculateCost(
  usage: LanguageModelUsage,
  modelName: keyof typeof pricing,
) {
  return (
    pricing[modelName].completion * usage.completionTokens +
    pricing[modelName].prompt * usage.promptTokens
  );
}
