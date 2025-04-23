"use client";

import { useState, useEffect, useRef } from "react";
import PdfUploader from "@/components/PdfUploader";
import PdfViewer from "@/components/PdfViewer";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isChatVisible, setIsChatVisible] = useState<boolean>(false);
  const [isLoadingExplanation, setIsLoadingExplanation] =
    useState<boolean>(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handlePdfLoad = (text: string, file: File) => {
    setPdfText(text);
    setPdfFile(file);
    setSelectedText(null);
    setExplanation(null);
    setIsChatVisible(false);
    setIsLoadingExplanation(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleTextSelect = (text: string) => {
    setSelectedText(text);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!text || text.trim().length === 0) {
      setExplanation(null);
      setIsLoadingExplanation(false);
      return;
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      console.log("Debounced selection processed:", text);

      if (pdfText && text && text.trim().length > 0) {
        setIsChatVisible(true);
        setExplanation(null);
        setIsLoadingExplanation(true);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
          const messagesForExplanation = [
            {
              role: "system" as const,
              content: `You are an expert assistant. Given the full text of a document and a user-selected portion of that text, provide a concise, one-sentence explanation of the selected text in the context of the document. Document: ###${pdfText}###`,
            },
            {
              role: "user" as const,
              content: `Explain this selection: ###${text}### Do it in 5-9 words.`,
            },
          ];

          setExplanation("");

          const response = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-3-7-sonnet",
              messages: messagesForExplanation,
            }),
            signal: controller.signal,
          });

          if (!response.ok || !response.body) {
            setExplanation(null);
            throw new Error(
              `API Error: ${response.statusText || "No response body"}`
            );
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          while (true) {
            if (controller.signal.aborted) {
              console.log("Fetch aborted during streaming");
              setExplanation(null);
              break;
            }
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            if (!controller.signal.aborted) {
              setExplanation(prev => (prev ?? "") + chunk);
            } else {
              console.log("Fetch aborted before setting state");
              setExplanation(null);
              break;
            }
          }
        } catch (error) {
          if ((error as Error).name === "AbortError") {
            console.log("Fetch aborted");
            setExplanation(null);
          } else {
            console.error("Error getting explanation:", error);
            setExplanation(
              "Sorry, I couldn't generate an explanation for the selection."
            );
          }
        } finally {
          setIsLoadingExplanation(false);
          if (abortControllerRef.current === controller) {
            abortControllerRef.current = null;
          }
        }
      } else {
        setSelectedText(null);
        setExplanation(null);
        setIsLoadingExplanation(false);
      }
    }, 500);
  };

  return (
    <main className="h-screen flex flex-col relative">
      <div className="container mx-auto px-6 pt-6 flex-shrink-0">
        <h1 className="text-3xl font-bold mb-6">
          PDF Paper Reader and AI Assistant
        </h1>
      </div>

      {!pdfFile ? (
        <div className="container mx-auto p-6 flex-grow flex items-center justify-center">
          <PdfUploader onPdfLoad={handlePdfLoad} />
        </div>
      ) : (
        <div className="flex-grow flex flex-col min-h-0 p-6 pt-0">
          <div className="flex-grow overflow-y-auto min-h-0 border rounded shadow-md">
            <PdfViewer file={pdfFile} onTextSelect={handleTextSelect} />
          </div>

          {isChatVisible && (
            <div className="fixed bottom-6 right-6 z-10 w-2xl h-[60vh] bg-white border rounded-lg shadow-xl flex flex-col">
              <button
                onClick={() => {
                  setIsChatVisible(false);
                  setIsLoadingExplanation(false);
                  if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                    abortControllerRef.current = null;
                  }
                }}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 z-20"
                aria-label="Close chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2 className="text-lg font-semibold p-4 border-b bg-gray-50 rounded-t-lg flex-shrink-0">
                AI Assistant
              </h2>
              <div className="flex-grow overflow-y-auto min-h-0">
                <ChatInterface
                  pdfText={pdfText}
                  selectedText={selectedText}
                  initialExplanation={explanation}
                  isLoading={isLoadingExplanation}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
