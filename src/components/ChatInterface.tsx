"use client";

import { useState } from "react";
import { modelNames, ModelName } from "@/lib/ai/models";
import ReactMarkdown from "react-markdown";

type ChatInterfaceProps = {
  pdfText: string | null;
  selectedText: string | null;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatInterface({
  pdfText,
  selectedText,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] =
    useState<ModelName>("claude-3-7-sonnet");

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
      // Create a context-aware message with the PDF content
      const systemPrompt = `You are a helpful assistant that answers questions about a PDF document. 
      Here is the document content: ${pdfText}${
        selectedText
          ? `\n\nThe user has highlighted the following text: ${selectedText}`
          : ""
      }`;

      // Make the API call
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            newUserMessage,
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      // Stream the response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body is null");

      // Initialize the response message
      const newAssistantMessage: Message = {
        role: "assistant",
        content: "",
      };
      setMessages(prev => [...prev, newAssistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk and update the message
        const chunk = new TextDecoder().decode(value);
        newAssistantMessage.content += chunk;

        // Update the UI with the streaming response
        setMessages(prev => [...prev.slice(0, -1), { ...newAssistantMessage }]);
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
    <div className="flex flex-col h-full border rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-medium">Chat with your document</h2>
        <select
          value={selectedModel}
          onChange={e => setSelectedModel(e.target.value as ModelName)}
          className="px-2 py-1 text-sm border rounded"
        >
          {modelNames.map(model => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      <div
        className="flex-1 p-4 overflow-y-auto space-y-4"
        style={{ minHeight: "400px", maxHeight: "500px" }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Ask questions about your document</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-100 ml-12"
                  : "bg-white-100 mr-12"
              }`}
            >
              <p className="text-sm font-semibold">
                {message.role === "user" ? "You" : "AI Assistant"}
              </p>
              <div className="mt-1 prose">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ask a question about the document..."
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!pdfText || isStreaming}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={!pdfText || !inputValue.trim() || isStreaming}
          >
            {isStreaming ? "Processing..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
