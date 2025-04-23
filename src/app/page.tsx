"use client";

import { useState } from "react";
import PdfUploader from "@/components/PdfUploader";
import PdfViewer from "@/components/PdfViewer";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);

  const handlePdfLoad = (text: string, file: File) => {
    setPdfText(text);
    setPdfFile(file);
    setSelectedText(null);
  };

  const handleTextSelect = (text: string) => {
    console.log("text", text);
    setSelectedText(text);
  };

  return (
    <main className="h-screen flex flex-col">
      <div className="container mx-auto flex flex-col flex-grow p-6 overflow-hidden">
        <h1 className="text-3xl font-bold mb-6">
          PDF Paper Reader and AI Assistant
        </h1>

        {!pdfFile ? (
          <div className="mb-8">
            <PdfUploader onPdfLoad={handlePdfLoad} />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
            <div className="flex flex-col lg:w-1/2">
              <h2 className="text-xl font-semibold mb-4">Document Viewer</h2>
              <div className="flex-grow overflow-y-auto min-h-0">
                <PdfViewer file={pdfFile} onTextSelect={handleTextSelect} />
              </div>
            </div>
            <div className="flex flex-col lg:w-1/2">
              <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
              <div className="overflow-y-auto min-h-0">
                <ChatInterface pdfText={pdfText} selectedText={selectedText} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
