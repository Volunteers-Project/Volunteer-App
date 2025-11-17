"use client";

import { useEffect, useRef } from "react";
import { renderAsync } from "docx-preview";

interface DocxViewerProps {
  fileUrl: string;
}

export default function DocxViewer({ fileUrl }: DocxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      if (!containerRef.current) return;

      const blob = await fetch(fileUrl).then((r) => r.blob());

      // docx-preview needs a clean container before re-rendering
      containerRef.current.innerHTML = "";

      await renderAsync(blob, containerRef.current, undefined, {
        className: "docx", // apply default styling
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        breakPages: false,
        debug: false,
      });
    }

    load();
  }, [fileUrl]);

  return (
    <div
      ref={containerRef}
      className="docx-container"
      style={{ background: "white" }}
    />
  );
}
