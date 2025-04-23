"use client";

import { useState, useEffect } from "react";
import { ModelName } from "@/lib/ai/models";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Import KaTeX CSS

type ChatInterfaceProps = {
  pdfText: string | null;
  selectedText: string | null;
  initialExplanation: string | null;
  isLoading: boolean;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatInterface({
  pdfText,
  selectedText,
  initialExplanation,
  isLoading,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] =
    useState<ModelName>("claude-3-7-sonnet");

  useEffect(() => {
    if (initialExplanation) {
      setMessages([{ role: "assistant", content: initialExplanation }]);
    } else {
      // Optional: Clear messages if explanation is cleared (e.g., user deselects text)
      // setMessages([]);
    }
    setInputValue("");
  }, [initialExplanation]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!inputValue.trim() || isStreaming) return;
    if (!pdfText) {
      setMessages([
        ...messages,
        { role: "user", content: inputValue },
        { role: "assistant", content: "Please upload a PDF first." },
      ]);
      setInputValue("");
      return;
    }

    const newUserMessage = { role: "user" as const, content: inputValue };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue("");
    setIsStreaming(true);

    try {
      const systemPrompt = `You are a helpful assistant that answers questions about a PDF document. 
      Here is the document content: ${pdfText}${
        selectedText
          ? `\n\nThe user has highlighted the following text: ${selectedText}`
          : ""
      }`;

      const messagesForApi = [
        { role: "system", content: systemPrompt },
        ...messages,
        newUserMessage,
      ];

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: messagesForApi,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body is null");

      const newAssistantMessage: Message = {
        role: "assistant",
        content: "",
      };
      setMessages(prev => [...prev, newAssistantMessage]);

      let accumulatedContent = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        accumulatedContent += chunk;

        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: "assistant", content: accumulatedContent },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 && !initialExplanation && isLoading ? (
          <div className="text-center text-gray-500 py-8">
            <p>Generating explanation...</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-lg max-w-full ${
                  message.role === "user"
                    ? "bg-blue-200 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="prose prose-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 border-t bg-gray-50 rounded-b-lg flex-shrink-0"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={
              initialExplanation ? "Ask a follow-up..." : "Ask a question..."
            }
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={!pdfText || isStreaming}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition duration-150 ease-in-out"
            disabled={!pdfText || !inputValue.trim() || isStreaming}
          >
            {isStreaming || isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
