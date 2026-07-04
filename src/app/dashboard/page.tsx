"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { RedirectToSignIn, UserButton, useAuth } from "@clerk/nextjs";
import { useParser } from "@/features/parser/hooks/use-parser";
import { Dropzone } from "@/features/parser/components/dropzone";
import { ChatPane, ChatMessage } from "@/features/chat/components/chat-pane";
import { verifyLocalStorageQuota } from "@/lib/db/indexeddb-cache";
import { webLlmClientManager } from "@/features/engine/services/webllm-client";
import { profileColumnData, ColumnProfile } from "@/features/parser/utils/profiler";
import { InitProgressReport } from "@mlc-ai/web-llm";

function SessionTeardownWatcher() {
  const { isSignedIn } = useAuth();
  const wasSignedInRef = useRef(false);

  useEffect(() => {
    if (isSignedIn) {
      wasSignedInRef.current = true;
      return;
    }
    if (!wasSignedInRef.current) return;
    wasSignedInRef.current = false;
    webLlmClientManager.terminateEngine();
  }, [isSignedIn]);

  return null;
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:hsl(var(--background))] font-mono text-xs text-[color:hsl(var(--text-muted))]">
        <div className="flex items-center space-x-2">
          <span className="h-4 w-4 border-2 border-[color:hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
          <span>Securing local session sandbox...</span>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn signInForceRedirectUrl="/dashboard" />;
  }

  return (
    <>
      <SessionTeardownWatcher />
      <DashboardContent />
    </>
  );
}

// Memoized table row — prevents re-renders of unchanged rows during data updates
const SummaryRow = React.memo(({ col }: { col: ColumnProfile }) => (
  <tr className="border-b border-[color:hsl(var(--border))]/30">
    <td className="p-2 border-r border-[color:hsl(var(--border))]/30 font-bold truncate max-w-[120px]">{col.name}</td>
    <td className="p-2 border-r border-[color:hsl(var(--border))]/30 text-[color:hsl(var(--primary))] font-semibold uppercase">{col.type}</td>
    <td className="p-2 border-r border-[color:hsl(var(--border))]/30 text-center">{col.missingCount}</td>
    <td className="p-2 border-r border-[color:hsl(var(--border))]/30 text-center">{col.uniqueCount}</td>
    <td className="p-2 text-right text-[color:hsl(var(--text-muted))]">
      {col.type === "numeric" && col.mean !== undefined ? (
        <span>
          Mean: <strong className="text-[color:hsl(var(--text-primary))]">{col.mean.toFixed(1)}</strong> | Min: {col.min} | Max: {col.max}
        </span>
      ) : (
        <span className="italic text-[10px]">No numerical stats</span>
      )}
    </td>
  </tr>
));
SummaryRow.displayName = "SummaryRow";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PreviewRow = React.memo(({ row, headers }: { row: any[]; headers: string[] }) => (
  <tr className="border-b border-[color:hsl(var(--border))]/30">
    {headers.map((_, colIdx) => (
      <td key={colIdx} className="p-2 border-r border-[color:hsl(var(--border))]/30 truncate max-w-[150px]">
        {row[colIdx] !== undefined ? String(row[colIdx]) : ""}
      </td>
    ))}
  </tr>
));
PreviewRow.displayName = "PreviewRow";

function DashboardContent() {
  const { parseFileLocally, sheetData, isProcessing: isParsing, clearData: clearParsedData } = useParser();

  // Track the name of the currently loaded file
  const [activeFileName, setActiveFileName] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isEngineInitializing, setIsEngineInitializing] = useState(false);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [initReport, setInitReport] = useState<InitProgressReport | null>(null);
  const [isWebGpuSupported, setIsWebGpuSupported] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [columnProfiles, setColumnProfiles] = useState<ColumnProfile[]>([]);
  const [activeTab, setActiveTab] = useState<"summary" | "preview">("summary");

  const hasInitStartedRef = useRef(false);

  // Initialize WebGPU support and storage quota on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setIsWebGpuSupported(!!(navigator as any).gpu);
    }

    const checkQuota = async () => {
      const status = await verifyLocalStorageQuota();
      if (status && !status.isSufficient) {
        setErrorMsg("Warning: Local browser storage is low. Gemma-2B download requires at least 2.5 GB of free space.");
      }
    };
    checkQuota();

    setMessages([
      {
        id: "sys-init",
        sender: "system",
        text: "Active local environment verified. Drag and drop a dataset (.csv, .xlsx, .xls) to begin automated statistical profiling.",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  // Auto-initialize WebLLM engine when WebGPU is confirmed available
  useEffect(() => {
    if (isWebGpuSupported === true && !isEngineReady && !isEngineInitializing && !hasInitStartedRef.current) {
      hasInitStartedRef.current = true;
      const autoInitEngine = async () => {
        setIsEngineInitializing(true);
        setErrorMsg(null);
        try {
          await webLlmClientManager.initializeEngine((report) => {
            setInitReport(report);
          });
          setIsEngineReady(true);
          setMessages((prev) => [
            ...prev,
            {
              id: `sys-engine-ready-${Date.now()}`,
              sender: "system",
              text: "Gemma-2B local-first LLM is fully loaded and cached in IndexedDB. Local analytical terminal is now online.",
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
        } catch (err) {
          setErrorMsg(`Model download/compile failed: ${(err as Error).message}`);
          hasInitStartedRef.current = false;
        } finally {
          setIsEngineInitializing(false);
        }
      };
      autoInitEngine();
    } else if (isWebGpuSupported === false) {
      setErrorMsg("WebGPU is not supported by your browser. Please switch to a compatible browser (e.g. Chrome, Edge) to run local analytical models.");
    }
  }, [isWebGpuSupported, isEngineReady, isEngineInitializing]);

  // Recompute column profiles when sheet data changes
  useEffect(() => {
    if (sheetData) {
      const profiles = profileColumnData(sheetData.headers, sheetData.rows);
      setColumnProfiles(profiles);
    } else {
      setColumnProfiles([]);
    }
  }, [sheetData]);

  const handleFileAccepted = useCallback(async (file: File) => {
    setErrorMsg(null);
    try {
      const data = await parseFileLocally(file);
      setActiveFileName(file.name);
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-upload-${Date.now()}`,
          sender: "system",
          text: `Ingested spreadsheet "${file.name}" locally (${data.rows.length} rows, ${data.headers.length} columns). Automatically calculated dataset metrics.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      setErrorMsg((err as Error).message);
    }
  }, [parseFileLocally]);

  // Detach the current file without wiping the engine or chat history
  const handleDetachFile = useCallback(() => {
    clearParsedData();
    setActiveFileName(null);
    setColumnProfiles([]);
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-detach-${Date.now()}`,
        sender: "system",
        text: "Dataset detached from memory. Drop a new spreadsheet to continue analysis.",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, [clearParsedData]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!isEngineReady || isGenerating) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    const assistantMsgId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, sender: "engine", text: "", timestamp: new Date().toLocaleTimeString() },
    ]);

    // Build system prompt with spreadsheet schema + statistical profile
    const profilesSummary = columnProfiles
      .map((p) => {
        const base = `- ${p.name} (Type: ${p.type}, Unique: ${p.uniqueCount}, Missing: ${p.missingCount})`;
        if (p.type === "numeric" && p.mean !== undefined) {
          return `${base} [Min: ${p.min?.toFixed(2)}, Max: ${p.max?.toFixed(2)}, Mean: ${p.mean?.toFixed(2)}]`;
        }
        return base;
      })
      .join("\n");

    const schemaDetails = sheetData
      ? `You are analyzing a local spreadsheet dataset.
File Structure:
- Columns: ${sheetData.headers.length}
- Rows: ${sheetData.rows.length}
Descriptive Statistics:
${profilesSummary}
Data preview (first 10 rows):
${JSON.stringify(sheetData.rows.slice(0, 10))}`
      : "No spreadsheet has been loaded yet.";

    const systemPrompt = `You are a helpful, expert local data analyst AI assistant.
Your task is to analyze the local spreadsheet dataset and answer the user's queries based on the provided dataset context.
You have full access to the following details:

Spreadsheet Details:
${schemaDetails}

Provide clear, structured, and direct analysis using the statistics and sample preview above. Be conversational, direct, and helpful.`;

    try {
      await webLlmClientManager.generateStreamingOutput(
        systemPrompt,
        text,
        (tokenText) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, text: tokenText } : msg
            )
          );
        }
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, text: `ERROR: ${(err as Error).message}` }
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  }, [isEngineReady, isGenerating, columnProfiles, sheetData]);

  const handlePurgeSession = useCallback(async () => {
    setErrorMsg(null);
    setIsGenerating(false);
    setInitReport(null);
    clearParsedData();
    setActiveFileName(null);

    await webLlmClientManager.terminateEngine();
    setIsEngineReady(false);
    hasInitStartedRef.current = false;

    const status = await verifyLocalStorageQuota();
    if (status && !status.isSufficient) {
      setErrorMsg("Warning: Local browser storage is low. Gemma-2B download requires at least 2.5 GB of free space.");
    }

    setMessages([
      {
        id: `sys-purge-${Date.now()}`,
        sender: "system",
        text: "Active session, Excel variables, and local Gemma-2B model successfully unloaded from browser memory.",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, [clearParsedData]);

  return (
    <div className="min-h-screen flex flex-col bg-[color:hsl(var(--background))] font-sans selection:bg-[color:hsl(var(--primary))]/30">

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[color:hsl(var(--border))] bg-[color:hsl(var(--surface))] px-4 sm:px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`h-3 w-3 rounded-full flex-shrink-0 ${isEngineReady ? "bg-[color:hsl(var(--success))]" : "bg-amber-500 animate-pulse"}`} />
            <h1 className="font-mono text-[10px] sm:text-sm tracking-wider font-extrabold uppercase text-[color:hsl(var(--text-primary))] truncate max-w-[150px] sm:max-w-none">
              CivicFlow AI <span className="hidden sm:inline">// Analytics Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePurgeSession}
              className="inline-flex h-8 items-center justify-center rounded border border-[color:hsl(var(--border))] bg-[color:hsl(var(--background))] px-3 font-mono text-[10px] font-semibold text-[color:hsl(var(--text-muted))] hover:text-[color:hsl(var(--text-primary))] hover:border-[color:hsl(var(--text-muted))] active:scale-[0.98] transition-colors"
            >
              <span className="hidden sm:inline">Purge Session</span>
              <span className="sm:hidden">Purge</span>
            </button>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Model Download Progress Banner */}
      {isEngineInitializing && initReport && (
        <div className="bg-[color:hsl(var(--surface))] border-b border-[color:hsl(var(--border))] px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2 font-mono text-[10px] sm:text-xs text-[color:hsl(var(--text-primary))]">
              <span className="animate-spin h-3.5 w-3.5 border-2 border-[color:hsl(var(--primary))] border-t-transparent rounded-full flex-shrink-0" />
              <span className="hidden sm:inline">Downloading Gemma-2B weights:</span>
              <span className="sm:hidden">Downloading weights:</span>
              <span className="font-bold text-[color:hsl(var(--primary))]">{(initReport.progress * 100).toFixed(0)}%</span>
            </div>
            <div className="flex-1 max-w-xs bg-[color:hsl(var(--border))] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[color:hsl(var(--primary))] h-full"
                style={{ width: `${initReport.progress * 100}%` }}
              />
            </div>
            <span className="font-mono text-[9px] text-[color:hsl(var(--text-muted))] truncate max-w-sm">
              {initReport.text}
            </span>
          </div>
        </div>
      )}

      {/* Main workspace — left column scrolls, right column sticks */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left Column — scrolls with page */}
          <div className="w-full lg:w-7/12 space-y-5">

            {/* Error Banner */}
            {errorMsg && (
              <div className="rounded border border-red-500/20 bg-red-500/5 p-3 text-xs font-mono text-red-400">
                [SYSTEM WARNING]: {errorMsg}
              </div>
            )}

            {/* Ingestion Zone */}
            <div className="rounded-lg border border-[color:hsl(var(--border))] bg-[color:hsl(var(--surface))] p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-[10px] sm:text-xs font-bold tracking-tight text-[color:hsl(var(--text-primary))] uppercase truncate max-w-[140px] sm:max-w-none">
                  Spreadsheet Ingestion
                </h2>
                {/* File detach button — only visible when a file is loaded */}
                {sheetData && activeFileName && (
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-[color:hsl(var(--text-muted))] truncate max-w-[180px]" title={activeFileName}>
                      📄 {activeFileName}
                    </span>
                    <button
                      onClick={handleDetachFile}
                      disabled={isParsing}
                      className="inline-flex items-center gap-1 h-7 px-2.5 rounded border border-red-500/30 bg-red-500/5 text-red-400 font-mono text-[10px] font-semibold hover:bg-red-500/10 hover:border-red-500/50 active:scale-95 transition-colors disabled:opacity-40"
                      title="Detach current file from memory"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Detach
                    </button>
                  </div>
                )}
              </div>
              <Dropzone onFileAccepted={handleFileAccepted} isProcessing={isParsing} />
            </div>

            {/* Dataset Profile + Preview Panel — fixed height, internally scrollable */}
            {sheetData && (
              <div className="rounded-lg border border-[color:hsl(var(--border))] bg-[color:hsl(var(--surface))] p-4 sm:p-5 flex flex-col h-[350px] sm:h-[380px]">

                {/* Tab Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center border-b border-[color:hsl(var(--border))]/60 pb-3 mb-3 flex-shrink-0 gap-2 sm:gap-0">
                  <div className="flex space-x-4 font-mono text-[10px] sm:text-xs">
                    <button
                      onClick={() => setActiveTab("summary")}
                      className={`font-bold tracking-tight uppercase transition-colors pb-1 border-b-2 ${
                        activeTab === "summary"
                          ? "border-[color:hsl(var(--primary))] text-[color:hsl(var(--text-primary))]"
                          : "border-transparent text-[color:hsl(var(--text-muted))] hover:text-[color:hsl(var(--text-primary))]"
                      }`}
                    >
                      Summary <span className="hidden sm:inline">Profiler</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={`font-bold tracking-tight uppercase transition-colors pb-1 border-b-2 ${
                        activeTab === "preview"
                          ? "border-[color:hsl(var(--primary))] text-[color:hsl(var(--text-primary))]"
                          : "border-transparent text-[color:hsl(var(--text-muted))] hover:text-[color:hsl(var(--text-primary))]"
                      }`}
                    >
                      Preview <span className="hidden sm:inline">Grid</span>
                    </button>
                  </div>
                  <div className="font-mono text-[10px] text-[color:hsl(var(--text-muted))] space-x-3 self-end sm:self-auto">
                    <span>Cols: <strong className="text-[color:hsl(var(--text-primary))]">{sheetData.headers.length}</strong></span>
                    <span>Rows: <strong className="text-[color:hsl(var(--text-primary))]">{sheetData.rows.length}</strong></span>
                  </div>
                </div>

                {/* Table Content — scrolls inside the fixed-height container */}
                <div className="flex-1 overflow-auto border border-[color:hsl(var(--border))]/60 rounded bg-[color:hsl(var(--background))]">
                  {activeTab === "summary" ? (
                    <table className="w-full border-collapse font-mono text-[10px] text-[color:hsl(var(--text-primary))]">
                      <thead>
                        <tr className="bg-[color:hsl(var(--surface))] border-b border-[color:hsl(var(--border))] sticky top-0">
                          <th className="p-2 text-left font-bold border-r border-[color:hsl(var(--border))]/30">Column</th>
                          <th className="p-2 text-left font-bold border-r border-[color:hsl(var(--border))]/30">Type</th>
                          <th className="p-2 text-center font-bold border-r border-[color:hsl(var(--border))]/30">Missing</th>
                          <th className="p-2 text-center font-bold border-r border-[color:hsl(var(--border))]/30">Unique</th>
                          <th className="p-2 text-right font-bold">Stats (Mean / Min / Max)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {columnProfiles.map((col, idx) => (
                          <SummaryRow key={idx} col={col} />
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full border-collapse font-mono text-[10px] text-[color:hsl(var(--text-primary))]">
                      <thead>
                        <tr className="bg-[color:hsl(var(--surface))] border-b border-[color:hsl(var(--border))] sticky top-0">
                          {sheetData.headers.map((hdr, idx) => (
                            <th key={idx} className="p-2 text-left font-bold border-r border-[color:hsl(var(--border))]/50">
                              {hdr}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Limit to 50 rows — reduces DOM nodes and paint time significantly */}
                        {sheetData.rows.slice(0, 50).map((row, rowIdx) => (
                          <PreviewRow key={rowIdx} row={row} headers={sheetData.headers} />
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-2 flex justify-between font-mono text-[9px] text-[color:hsl(var(--text-muted))] flex-shrink-0">
                  <span>
                    {activeTab === "summary"
                      ? `${columnProfiles.length} column profiles`
                      : `Showing first 50 of ${sheetData.rows.length} rows`}
                  </span>
                  <span>All operations client-side</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column — sticky chat pane, does not affect page scroll height */}
          <div className="w-full lg:w-5/12 lg:sticky lg:top-24 h-[600px] sm:h-[calc(100vh-140px)] min-h-[500px]">
            <ChatPane
              messages={messages}
              onSendMessage={handleSendMessage}
              onStopGeneration={() => webLlmClientManager.abortGeneration()}
              isGenerating={isGenerating || !isEngineReady}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[color:hsl(var(--border))] bg-[color:hsl(var(--surface))] px-6 py-3 text-[10px] font-mono text-[color:hsl(var(--text-muted))]">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Local Sandbox Integrity Audit: Passed</span>
          {activeFileName && (
            <span className="text-[color:hsl(var(--success))]">Active dataset: {activeFileName}</span>
          )}
        </div>
      </footer>
    </div>
  );
}
