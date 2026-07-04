"use client";

import React, { useState, useRef } from "react";

interface DropzoneProps {
  onFileAccepted: (file: File) => void;
  isProcessing: boolean;
}

export function Dropzone({ onFileAccepted, isProcessing }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      // Prevent flickering when dragging over child elements
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    const validExtensions = [".csv", ".xls", ".xlsx"];
    const fileName = file.name.toLowerCase();
    const isValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExtension) {
      alert("Unsupported file format. Please drop a valid .csv, .xls, or .xlsx file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds the 10MB limit for local, in-memory processing.");
      return;
    }

    onFileAccepted(file);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative w-full rounded-lg border border-dashed p-6 sm:p-10 text-center transition-all duration-150 ${
        isDragActive
          ? "border-[color:hsl(var(--primary))] bg-[color:hsl(var(--primary))]/5"
          : "border-[color:hsl(var(--border))] bg-[color:hsl(var(--surface))]"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv, .xlsx, .xls"
        className="hidden"
        onChange={handleFileInput}
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Geometric Document Upload Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-md border border-[color:hsl(var(--border))] bg-[color:hsl(var(--background))] text-[color:hsl(var(--text-muted))]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-[color:hsl(var(--text-primary))]">
            Drag & drop dataset spreadsheet file
          </p>
          <p className="text-xs text-[color:hsl(var(--text-muted))]">
            CSV, XLS, or XLSX up to 10MB
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="inline-flex h-9 items-center justify-center rounded-md bg-[color:hsl(var(--primary))] px-4 text-xs font-semibold text-[color:hsl(var(--primary-foreground))] shadow-sm transition-all hover:bg-opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {isProcessing ? "Processing File..." : "Select File"}
        </button>
      </div>
    </div>
  );
}
