"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";

export interface ChatMessage {
  id: string;
  sender: "user" | "engine" | "system";
  text: string;
  timestamp: string;
}

interface ChatPaneProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onStopGeneration: () => void;
  isGenerating: boolean;
}

// Inline Code / Format Parser
const parseInlineFormatting = (inlineText: string) => {
  const subParts = inlineText.split(/(\*\*.*?\*\*|`.*?`)/g);
  return subParts.map((subPart, subIdx) => {
    if (subPart.startsWith("**") && subPart.endsWith("**")) {
      return (
        <strong key={subIdx} className="font-semibold text-[color:hsl(var(--text-primary))]">
          {subPart.slice(2, -2)}
        </strong>
      );
    }
    if (subPart.startsWith("`") && subPart.endsWith("`")) {
      return (
        <code key={subIdx} className="px-1.5 py-0.5 rounded bg-[color:hsl(var(--background))] text-[color:hsl(var(--success))] font-mono text-[11px] border border-[color:hsl(var(--border))]">
          {subPart.slice(1, -1)}
        </code>
      );
    }
    return subPart;
  });
};

// Memoized Code Block
const CodeBlock = React.memo(({ language, code }: { language: string; code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silently ignored
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-[color:hsl(var(--border))] bg-[color:hsl(var(--background))] font-mono text-[11px] shadow-sm">
      <div className="flex items-center justify-between bg-[color:hsl(var(--surface))] px-3.5 py-2 text-[10px] font-medium tracking-wider text-[color:hsl(var(--text-muted))] border-b border-[color:hsl(var(--border))] uppercase">
        <span>{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="hover:text-[color:hsl(var(--text-primary))] transition-colors flex items-center space-x-1"
        >
          {copied ? (
            <span className="text-[color:hsl(var(--success))]">Copied</span>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-[color:hsl(var(--text-primary))] leading-relaxed"><code>{code}</code></pre>
    </div>
  );
});
CodeBlock.displayName = "CodeBlock";

// Render Custom Markdown Elements Safely
const MarkdownRenderer = React.memo(({ text }: { text: string }) => {
  const parts = useMemo(() => text.split(/(```[\s\S]*?```)/g), [text]);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          let language = "text";
          let code = part.slice(3, -3).trim();
          if (lines.length > 0 && !lines[0].includes(" ") && lines[0].length < 15) {
            language = lines[0];
            code = lines.slice(1).join("\n");
          }
          return <CodeBlock key={index} language={language} code={code} />;
        }

        const lines = part.split("\n");
        const jsxElements: React.ReactNode[] = [];
        let currentListItems: React.ReactNode[] = [];
        let currentListType: "ul" | "ol" | null = null;

        const flushList = (key: string | number) => {
          if (currentListType === "ul" && currentListItems.length > 0) {
            jsxElements.push(
              <ul key={`ul-${key}`} className="list-disc pl-5 my-2 space-y-1 text-[color:hsl(var(--text-primary))]">
                {currentListItems}
              </ul>
            );
            currentListItems = [];
            currentListType = null;
          } else if (currentListType === "ol" && currentListItems.length > 0) {
            jsxElements.push(
              <ol key={`ol-${key}`} className="list-decimal pl-5 my-2 space-y-1 text-[color:hsl(var(--text-primary))]">
                {currentListItems}
              </ol>
            );
            currentListItems = [];
            currentListType = null;
          }
        };

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmedLine = line.trim();

          if (trimmedLine.startsWith("#")) {
            flushList(i);
            const level = trimmedLine.match(/^#+/)?.[0].length || 1;
            const headerText = trimmedLine.replace(/^#+\s*/, "");
            const headingClass =
              level === 1
                ? "text-sm font-semibold text-[color:hsl(var(--text-primary))] mt-3 mb-1"
                : "text-xs font-semibold text-[color:hsl(var(--text-primary))] mt-2 mb-1";
            const Tag = level === 1 ? "h3" : "h4";

            jsxElements.push(
              <Tag key={i} className={headingClass}>
                {parseInlineFormatting(headerText)}
              </Tag>
            );
          } else if (trimmedLine.startsWith("* ") || trimmedLine.startsWith("- ") || trimmedLine.startsWith("• ")) {
            if (currentListType !== "ul") {
              flushList(i);
              currentListType = "ul";
            }
            currentListItems.push(
              <li key={i} className="leading-relaxed text-[13px]">
                {parseInlineFormatting(trimmedLine.replace(/^[\*\-\•]\s*/, ""))}
              </li>
            );
          } else if (/^\d+\.\s+/.test(trimmedLine)) {
            if (currentListType !== "ol") {
              flushList(i);
              currentListType = "ol";
            }
            currentListItems.push(
              <li key={i} className="leading-relaxed text-[13px]">
                {parseInlineFormatting(trimmedLine.replace(/^\d+\.\s*/, ""))}
              </li>
            );
          } else if (trimmedLine === "") {
            flushList(i);
          } else {
            flushList(i);
            jsxElements.push(
              <p key={i} className="my-1 leading-relaxed text-[13px] text-[color:hsl(var(--text-primary))]">
                {parseInlineFormatting(line)}
              </p>
            );
          }
        }

        flushList(lines.length);
        return <React.Fragment key={index}>{jsxElements}</React.Fragment>;
      })}
    </>
  );
});
MarkdownRenderer.displayName = "MarkdownRenderer";

// Message Bubble
const MessageBubble = React.memo(({ message }: { message: ChatMessage }) => {
  const isUser = message.sender === "user";

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1 w-full max-w-full`}>
      {/* Sender Identifier */}
      <span className="text-[10px] font-semibold text-[color:hsl(var(--text-muted))] uppercase tracking-wider px-1">
        {isUser ? "You" : "AI Analyst"}
      </span>

      <div className={`flex items-start gap-3 w-full ${isUser ? "justify-end" : "justify-start"}`}>
        {!isUser && (
          <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-gradient-to-tr from-[color:hsl(var(--success))] to-[color:hsl(142,60%,55%)] text-[color:hsl(var(--success-foreground))] flex items-center justify-center font-bold text-[10px] shadow-sm select-none">
            AI
          </div>
        )}

        <div
          className={`rounded-xl px-4 py-2.5 shadow-sm max-w-[85%] sm:max-w-[75%] break-words ${
            isUser
              ? "bg-[color:hsl(var(--surface))] text-[color:hsl(var(--text-primary))] border border-[color:hsl(var(--border))] rounded-tr-none"
              : "bg-[color:hsl(var(--background))] border border-[color:hsl(var(--border))] text-[color:hsl(var(--text-primary))] rounded-tl-none"
          }`}
        >
          <div className="text-[13px] leading-relaxed">
            {isUser ? message.text : <MarkdownRenderer text={message.text} />}
          </div>
        </div>
      </div>
    </div>
  );
});
MessageBubble.displayName = "MessageBubble";

export function ChatPane({ messages, onSendMessage, onStopGeneration, isGenerating }: ChatPaneProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Track whether the user has scrolled away from the bottom
  const isAtBottomRef = useRef(true);

  const scrollToBottom = useCallback((force = false) => {
    if (force || isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Detect user scroll position — unlock auto-scroll only when they reach the bottom
  const handleFeedScroll = useCallback(() => {
    const el = feedRef.current;
    if (!el) return;
    // Consider "at bottom" if within 60px of the scroll end
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  }, []);

  // Auto-scroll on new messages / generation ticks — respects user scroll position
  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating, scrollToBottom]);

  // When user sends a message, always force-scroll to bottom
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
    isAtBottomRef.current = true;
    scrollToBottom(true);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    setInputValue(prompt);
    textareaRef.current?.focus();
  };

  const suggestions = [
    { label: "Column Profiles", prompt: "Explain the dataset summary stats and key metrics." },
    { label: "Detect Outliers", prompt: "Scan the numeric columns and point out potential outliers." },
    { label: "Missing Values", prompt: "Identify any columns with missing values and suggest how to handle them." },
    { label: "Trend Analysis", prompt: "Analyze the dataset for trends or correlations based on the preview rows." }
  ];

  const visibleMessages = useMemo(() => messages.filter((m) => m.sender !== "system"), [messages]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-[color:hsl(var(--border))] bg-[color:hsl(var(--surface))] shadow-2xl overflow-hidden font-sans text-[color:hsl(var(--text-primary))]">

      {/* Header Bar */}
      <div className="flex items-center space-x-2 border-b border-[color:hsl(var(--border))] px-4 py-3 bg-[color:hsl(var(--surface))]/80 backdrop-blur-sm">
        <span className={`h-2 w-2 rounded-full ${isGenerating ? "bg-[color:hsl(var(--warning))] animate-pulse" : "bg-[color:hsl(var(--success))]"}`} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-[color:hsl(var(--text-muted))]">
          AI Analyst Workspace
        </span>
      </div>

      {/* Message Feed Container */}
      <div
        ref={feedRef}
        onScroll={handleFeedScroll}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-[color:hsl(var(--background))]"
      >
        {visibleMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[color:hsl(var(--text-muted))]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2 opacity-50">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-xs max-w-[280px] leading-relaxed">
              Ask a question or select a quick analysis suggestion below.
            </p>
          </div>
        ) : (
          visibleMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}

        {/* Streaming Indicator — Typing Dots */}
        {isGenerating && (
          <div className="flex items-start gap-3 w-full justify-start">
            <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-gradient-to-tr from-[color:hsl(var(--success))] to-[color:hsl(142,60%,55%)] text-[color:hsl(var(--success-foreground))] flex items-center justify-center font-bold text-[10px]">
              AI
            </div>
            <div className="rounded-xl rounded-tl-none bg-[color:hsl(var(--background))] border border-[color:hsl(var(--border))] px-4 py-3 flex items-center space-x-1 h-[32px]">
              <span className="h-1.5 w-1.5 bg-[color:hsl(var(--success))] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 bg-[color:hsl(var(--success))] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 bg-[color:hsl(var(--success))] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips Panel */}
      <div className="px-4 py-2 border-t border-[color:hsl(var(--border))] bg-[color:hsl(var(--surface))]">
        <div className="flex flex-wrap gap-2 justify-start items-center">
          {suggestions.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestionClick(chip.prompt)}
              disabled={isGenerating}
              className="text-[11px] bg-[color:hsl(var(--background))] hover:bg-[color:hsl(var(--surface))] border border-[color:hsl(var(--border))] text-[color:hsl(var(--text-muted))] hover:text-[color:hsl(var(--text-primary))] px-3 py-1.5 rounded-lg active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none font-medium whitespace-nowrap"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Action Area */}
      <div className="p-4 bg-[color:hsl(var(--surface))] border-t border-[color:hsl(var(--border))]">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col border border-[color:hsl(var(--border))] bg-[color:hsl(var(--background))] rounded-xl p-2 transition-all duration-200 focus-within:border-[color:hsl(var(--primary))]/60 focus-within:ring-1 focus-within:ring-[color:hsl(var(--primary))]/20"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            placeholder={isGenerating ? "Analyzing..." : "Ask the AI Analyst about your dataset..."}
            className="w-full resize-none bg-transparent border-0 outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 text-[13px] text-[color:hsl(var(--text-primary))] placeholder-[color:hsl(var(--text-muted))] px-3 pt-2 pb-1.5 leading-relaxed min-h-[36px] max-h-[140px]"
          />
          <div className="flex items-center justify-between mt-1 px-1.5 pb-0.5">
            {/* Attachment Button — disabled; spreadsheets handled via Ingestion Zone */}
            <button
              type="button"
              disabled
              className="p-1.5 rounded-lg text-[color:hsl(var(--text-muted))] hover:bg-[color:hsl(var(--surface))] transition-colors opacity-40 cursor-not-allowed"
              title="Spreadsheets are handled via the Ingestion Zone"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>

            {/* Send / Stop Action — toggles based on generation state */}
            {isGenerating ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 hover:bg-red-500 text-white shadow-md transition-all active:scale-95"
                title="Stop generation"
              >
                {/* Stop square icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[color:hsl(var(--primary))] hover:bg-opacity-90 text-[color:hsl(var(--primary-foreground))] shadow-md transition-all active:scale-95 disabled:opacity-20 disabled:pointer-events-none"
                title="Send query"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}