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
  const [internalSelectedText, setInternalSelectedText] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);

      // Clean up the object URL when the component unmounts or file changes
      return () => {
        URL.revokeObjectURL(url);
        setFileUrl(null);
      };
    }
  }, [file]);

  // Callback for the highlight plugin
  const handleSelection = (selectedText: string) => {
    setTimeout(() => {
      // Use a state to track the text to avoid calling onTextSelect multiple times
      // for the same selection end event, as renderHighlightTarget might fire rapidly.
      if (
        selectedText &&
        selectedText.trim().length > 0 &&
        selectedText !== internalSelectedText
      ) {
        const trimmedText = selectedText.trim();
        setInternalSelectedText(trimmedText);
        onTextSelect(trimmedText);
      }
      // If selection is cleared (empty string), reset internal state
      if (!selectedText && internalSelectedText) {
        setInternalSelectedText(null);
        // Optionally call onTextSelect with null/empty string if desired
        // onTextSelect('');
      }
    }, 0); // Defer state update to next tick
  };

  const renderHighlightTarget = (props: RenderHighlightTargetProps) => {
    // Call handleSelection whenever renderHighlightTarget is invoked with new text
    handleSelection(props.selectedText);

    // Render nothing visible - we just need the callback
    return <></>;
  };

  const highlightPluginInstance = highlightPlugin({
    renderHighlightTarget,
    trigger: Trigger.TextSelection, // Trigger on text selection
  });

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // Use a stable pdfjs version. Find the latest compatible version if needed.
  const workerUrl = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

  if (!fileUrl) {
    return <div>Loading PDF...</div>;
  }

  return (
    <Worker workerUrl={workerUrl}>
      {/* Ensure the container has a defined height relative to its parent */}
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
