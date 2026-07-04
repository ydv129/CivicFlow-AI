"use client";

import { useState } from "react";
import { excelParserWorkerCode } from "../utils/excel-worker";

export interface ParsedSheet {
  headers: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[][];
}

export function useParser() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [sheetData, setSheetData] = useState<ParsedSheet | null>(null);

  const parseFileLocally = (file: File): Promise<ParsedSheet> => {
    return new Promise((resolve, reject) => {
      setIsProcessing(true);

      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // Initialize dynamic blob URL worker instance
        const blob = new Blob([excelParserWorkerCode], { type: "application/javascript" });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);

        // Blob workers have no origin — pass the absolute URL so importScripts can resolve it.
        const xlsxScriptUrl = `${window.location.origin}/lib/xlsx.full.min.js`;
        worker.postMessage({ arrayBuffer, xlsxScriptUrl });

        worker.onmessage = (event) => {
          setIsProcessing(false);
          worker.terminate();
          URL.revokeObjectURL(workerUrl);

          if (event.data.error) {
            reject(new Error(event.data.error));
          } else if (event.data.rows.length > 5000) {
            reject(new Error("Row count exceeds the 5,000 row limit for local, in-memory processing."));
          } else {
            const data: ParsedSheet = {
              headers: event.data.headers,
              rows: event.data.rows,
            };
            setSheetData(data);
            resolve(data);
          }
        };

        worker.onerror = (err) => {
          setIsProcessing(false);
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          reject(err);
        };
      };

      fileReader.onerror = () => {
        setIsProcessing(false);
        reject(new Error("File load processing failed on browser disk read context."));
      };

      fileReader.readAsArrayBuffer(file);
    });
  };

  const clearData = () => {
    setSheetData(null);
  };

  return { parseFileLocally, sheetData, isProcessing, clearData };
}
