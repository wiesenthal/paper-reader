"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

type PdfUploaderProps = {
  onPdfLoad: (pdfText: string, pdfFile: File) => void;
};

export default function PdfUploader({ onPdfLoad }: PdfUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!file.type.includes("pdf")) {
        setError("Please upload a PDF file");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Process PDF to extract text using pdfjs-dist
        const arrayBuffer = await file.arrayBuffer();
        
        // Load the PDF and extract text
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
          `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let extractedText = `File: ${file.name}\n\n`;
        
        // Extract text from first 25 pages (limit to avoid excessive processing)
        // For academic papers, important content is usually in the first 10-20 pages
        const maxPages = Math.min(pdf.numPages, 25);
        for (let i = 1; i <= maxPages; i++) {
          try {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .filter((item: any) => item.str && item.str.trim()) // Filter empty strings
              .map((item: any) => item.str.trim())
              .join(" ");
            
            if (pageText.length > 0) {
              extractedText += `Page ${i}:\n${pageText}\n\n`;
            }
          } catch (pageError) {
            console.warn(`Error extracting text from page ${i}:`, pageError);
            extractedText += `Page ${i}: [Error extracting text]\n\n`;
          }
        }
        
        // Pass the extracted text to the parent component
        onPdfLoad(extractedText, file);
        
      } catch (err) {
        console.error("Error processing PDF:", err);
        setError("Error processing PDF. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [onPdfLoad]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
    >
      <input {...getInputProps()} />
      {isLoading ? (
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-gray-500">Processing PDF...</p>
        </div>
      ) : (
        <div>
          <p className="text-lg">
            {isDragActive
              ? "Drop your PDF here..."
              : "Drag & drop a PDF, or click to select one"}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Your document will be processed locally and securely.
          </p>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}