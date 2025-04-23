import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { models, ModelName } from "@/lib/ai/models";

export async function POST(req: NextRequest) {
  try {
    const { model, messages, temperature = 0.7, maxTokens } = await req.json();

    if (!model || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const selectedModel = models[model as ModelName];
    if (!selectedModel) {
      return NextResponse.json(
        { error: `Model '${model}' not supported` },
        { status: 400 }
      );
    }

    // Stream the response
    const { textStream, } = streamText({
      model: selectedModel,
      messages,
      temperature,
      maxTokens,
    });

    return new Response(textStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}