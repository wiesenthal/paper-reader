"use client";

import React, { useState, useEffect } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import {
  highlightPlugin,
  RenderHighlightTargetProps,
  Trigger,
} from "@react-pdf-viewer/highlight";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";

interface PdfViewerProps {
  file: File;
  onTextSelect: (text: string) => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ file, onTextSelect }) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  // State to store the text directly from the plugin callback
  const [rawSelectedText, setRawSelectedText] = useState<string>("");
  // State to track the last text passed to the parent to avoid duplicates
  const [internalSelectedText, setInternalSelectedText] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);

      return () => {
        URL.revokeObjectURL(url);
        setFileUrl(null);
        // Reset selection state on file change
        setRawSelectedText("");
        setInternalSelectedText(null);
      };
    }
  }, [file]);

  // Effect to handle selection changes after render
  useEffect(() => {
    const trimmedText = rawSelectedText.trim();

    if (trimmedText.length > 0 && trimmedText !== internalSelectedText) {
      // New, non-empty selection different from the last one sent
      setInternalSelectedText(trimmedText);
      onTextSelect(trimmedText);
    } else if (trimmedText.length === 0 && internalSelectedText !== null) {
      // Selection was cleared
      setInternalSelectedText(null);
      // Optionally inform parent about cleared selection if needed
      // onTextSelect("");
    }
    // Dependencies: Run when raw text changes, or internal state changes, or the callback changes
  }, [rawSelectedText, internalSelectedText, onTextSelect]);

  const renderHighlightTarget = (props: RenderHighlightTargetProps) => {
    // Update the raw selected text state whenever the plugin reports a change
    setRawSelectedText(props.selectedText);
    // Render nothing visible - we just need the callback trigger
    return <></>;
  };

  const highlightPluginInstance = highlightPlugin({
    renderHighlightTarget,
    trigger: Trigger.TextSelection,
  });

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const workerUrl = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

  if (!fileUrl) {
    return <div>Loading PDF...</div>;
  }

  return (
    <Worker workerUrl={workerUrl}>
      <div className="h-full w-full overflow-auto border rounded-lg max-h-full">
        <Viewer
          fileUrl={fileUrl}
          plugins={[highlightPluginInstance, defaultLayoutPluginInstance]}
        />
      </div>
    </Worker>
  );
};

export default PdfViewer;
