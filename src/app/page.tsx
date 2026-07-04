"use client";

import Link from "next/link";
import React from "react";

const features = [
  {
    index: "01",
    label: "Local Parsing Engine",
    title: "SheetJS Web Worker",
    desc: "Ingest spreadsheets up to 10 MB and 5,000 rows (.xlsx, .csv, .xls). Data structures live entirely in transient in-memory worker threads — nothing persists to disk.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    index: "02",
    label: "WebGPU Inference",
    title: "Gemma-2B Local-First",
    desc: "Runs Google Gemma-2B directly in a WebGPU context. Model weights are cached in IndexedDB after the first download — fully offline from that point on.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    index: "03",
    label: "Secure Airgap",
    title: "Zero Data Leakage",
    desc: "Enforces strict Auth-Privacy Separation (APSP). Clerk handles identity — your spreadsheet data never leaves the browser sandbox. CSP headers lock all outbound vectors.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    index: "04",
    label: "Statistical Profiler",
    title: "Automatic Column Analysis",
    desc: "Instantly computes type detection, missing-value counts, unique cardinality, mean, min, and max for every column — all in-browser with no external compute.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    index: "05",
    label: "AI Chat Terminal",
    title: "Streaming Markdown Answers",
    desc: "Ask natural language questions about your dataset. The AI streams token-by-token responses with full Markdown rendering — bold, code blocks, lists, and headings.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    index: "06",
    label: "Zero-Tracking",
    title: "No Tracking. No Logs.",
    desc: "No analytics SDK, no error reporting, no usage beacons. A strict Content Security Policy and automated audit scripts verify compliance on every build.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
  },
];

const specs = [
  { label: "Max File Size", value: "10 MB" },
  { label: "Max Row Count", value: "5,000" },
  { label: "Model", value: "Gemma-2B q4f16" },
  { label: "Inference", value: "WebGPU / WASM" },
  { label: "Storage", value: "IndexedDB" },
  { label: "Auth", value: "Clerk (APSP)" },
  { label: "Tracking", value: "Zero" },
  { label: "Server Uploads", value: "None" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[color:hsl(var(--background))] text-[color:hsl(var(--text-primary))] selection:bg-[color:hsl(var(--primary))]/30">

      {/* Decorative background — pointer-events-none so they don't interfere with scroll */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"
        style={{ maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 60%, transparent 100%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-0 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full"
        style={{ background: "hsl(var(--primary) / 0.08)", filter: "blur(100px)" }}
      />

      {/* ── Sticky Navigation ─────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-[color:hsl(var(--border))]/50 bg-[color:hsl(var(--background))]/80" style={{ backdropFilter: "blur(12px)" }}>
        <div className="mx-auto max-w-7xl w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 font-mono text-sm tracking-widest font-extrabold uppercase">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[color:hsl(var(--primary))] text-[color:hsl(var(--primary-foreground))] text-[9px] font-bold flex-shrink-0">
              CF
            </div>
            <span className="text-[color:hsl(var(--text-primary))]">CivicFlow AI</span>
          </div>
          <nav className="flex items-center gap-3">
            <a
              href="#features"
              className="hidden sm:inline-flex text-[11px] font-mono font-semibold text-[color:hsl(var(--text-muted))] hover:text-[color:hsl(var(--text-primary))] transition-colors px-2"
            >
              Features
            </a>
            <a
              href="#specs"
              className="hidden sm:inline-flex text-[11px] font-mono font-semibold text-[color:hsl(var(--text-muted))] hover:text-[color:hsl(var(--text-primary))] transition-colors px-2"
            >
              Specs
            </a>
            <Link
              href="/dashboard"
              className="inline-flex h-8 items-center justify-center rounded-md border border-[color:hsl(var(--border))] bg-[color:hsl(var(--surface))] px-4 text-[11px] font-mono font-semibold tracking-tight hover:border-[color:hsl(var(--text-muted))] hover:bg-[color:hsl(var(--background))] active:scale-[0.98] transition-colors"
            >
              Enter Console →
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 rounded-full border border-[color:hsl(var(--primary))]/25 bg-[color:hsl(var(--primary))]/6 px-3.5 py-1 text-[10px] font-mono tracking-wider text-[color:hsl(var(--primary))] uppercase mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:hsl(var(--success))]" />
          v1.0.0 Stable · 100% Client-Side Sandbox
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6" style={{ backgroundImage: "linear-gradient(180deg, hsl(var(--text-primary)) 40%, hsl(var(--text-muted)) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          Privacy-First<br />Spreadsheet Analytics<br />
          <span style={{ backgroundImage: "linear-gradient(90deg, hsl(var(--primary)), hsl(142.1 70.6% 45.3%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Powered by Local GPU
          </span>
        </h1>

        <p className="text-sm text-[color:hsl(var(--text-muted))] max-w-xl leading-relaxed mb-10">
          Analyze heavy datasets, compute statistical profiles, and run instruction-tuned AI models directly in browser memory. No server uploads. No API keys. Zero external network requests after model download.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md bg-[color:hsl(var(--primary))] px-7 text-[11px] font-mono font-semibold text-[color:hsl(var(--primary-foreground))] shadow-lg hover:opacity-90 active:scale-[0.97] transition-all w-full sm:w-auto"
          >
            Launch Active Workspace →
          </Link>
          <a
            href="#features"
            className="inline-flex h-11 items-center justify-center rounded-md border border-[color:hsl(var(--border))] bg-[color:hsl(var(--surface))] px-7 text-[11px] font-mono font-semibold tracking-tight hover:border-[color:hsl(var(--text-muted))] hover:bg-[color:hsl(var(--background))] active:scale-[0.97] transition-all w-full sm:w-auto"
          >
            Explore System Spec
          </a>
        </div>

        {/* Dashboard UI Mockup */}
        <div className="relative w-full max-w-3xl rounded-xl border border-[color:hsl(var(--border))] bg-[color:hsl(var(--surface))] p-4 shadow-2xl">
          {/* Mockup top bar */}
          <div className="flex items-center gap-1.5 mb-3 pb-3 border-b border-[color:hsl(var(--border))]/60">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-[color:hsl(var(--success))]/60" />
            <span className="ml-3 font-mono text-[9px] text-[color:hsl(var(--text-muted))] tracking-wider uppercase">CivicFlow AI // Analytics Dashboard</span>
          </div>
          <div className="grid grid-cols-12 gap-3 h-44">
            {/* Left pane */}
            <div className="col-span-7 rounded-lg border border-[color:hsl(var(--border))]/50 bg-[color:hsl(var(--background))] p-3 space-y-2.5 flex flex-col">
              <div className="h-1.5 w-20 rounded-full bg-[color:hsl(var(--border))]" />
              <div className="flex-1 rounded border border-dashed border-[color:hsl(var(--border))] bg-[color:hsl(var(--surface))]/40 flex items-center justify-center">
                <span className="font-mono text-[8px] text-[color:hsl(var(--text-muted))] tracking-wider">DROP SPREADSHEET HERE</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[40, 60, 35, 55].map((w, i) => (
                  <div key={i} className="h-1.5 rounded-full bg-[color:hsl(var(--border))]/70" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
            {/* Right pane — chat */}
            <div className="col-span-5 rounded-lg border border-[color:hsl(var(--border))]/50 bg-[color:hsl(var(--background))] p-3 space-y-2 flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:hsl(var(--success))]" />
                <div className="h-1.5 w-16 rounded-full bg-[color:hsl(var(--border))]" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-6 rounded bg-[color:hsl(var(--surface))] border border-[color:hsl(var(--border))]/40" />
                <div className="h-8 rounded bg-[color:hsl(var(--success))]/8 border border-[color:hsl(var(--success))]/15" />
                <div className="h-5 w-4/5 rounded bg-[color:hsl(var(--primary))]/10" />
              </div>
              <div className="h-6 rounded border border-[color:hsl(var(--border))]/60 bg-[color:hsl(var(--surface))]/60" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ───────────────────────────────────────────── */}
      <div className="w-full border-t border-[color:hsl(var(--border))]/40" />

      {/* ── Features Grid ─────────────────────────────────────── */}
      <section id="features" className="w-full max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-block font-mono text-[10px] text-[color:hsl(var(--primary))] tracking-widest uppercase mb-3">System Architecture</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Built for Privacy. Built for Performance.</h2>
          <p className="mt-3 text-sm text-[color:hsl(var(--text-muted))] max-w-lg mx-auto leading-relaxed">
            Every component runs client-side. The architecture enforces a zero-trust data boundary at the browser level.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.index} className="rounded-xl border border-[color:hsl(var(--border))] bg-[color:hsl(var(--surface))] p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[color:hsl(var(--primary))]/10 flex items-center justify-center text-[color:hsl(var(--primary))] flex-shrink-0">
                  {f.icon}
                </div>
                <span className="font-mono text-[9px] font-bold text-[color:hsl(var(--text-muted))] uppercase tracking-widest">{f.index}. {f.label}</span>
              </div>
              <h3 className="text-sm font-bold tracking-tight text-[color:hsl(var(--text-primary))]">{f.title}</h3>
              <p className="text-xs text-[color:hsl(var(--text-muted))] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ───────────────────────────────────────────── */}
      <div className="w-full border-t border-[color:hsl(var(--border))]/40" />

      {/* ── Tech Specs Strip ──────────────────────────────────── */}
      <section id="specs" className="w-full max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="inline-block font-mono text-[10px] text-[color:hsl(var(--primary))] tracking-widest uppercase mb-3">Technical Specs</div>
          <h2 className="text-2xl font-extrabold tracking-tight">System Parameters</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {specs.map((s) => (
            <div key={s.label} className="rounded-xl border border-[color:hsl(var(--border))] bg-[color:hsl(var(--surface))] p-4 text-center space-y-1.5">
              <div className="font-mono text-[9px] text-[color:hsl(var(--text-muted))] uppercase tracking-wider">{s.label}</div>
              <div className="font-mono text-sm font-extrabold text-[color:hsl(var(--text-primary))]">{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-[color:hsl(var(--primary))]/20 bg-[color:hsl(var(--primary))]/5 px-8 py-12 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ready to analyze your data locally?</h2>
          <p className="text-sm text-[color:hsl(var(--text-muted))] max-w-md mx-auto leading-relaxed">
            Sign in to access the secure workspace. Your data never leaves your browser.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md bg-[color:hsl(var(--primary))] px-8 text-[11px] font-mono font-semibold text-[color:hsl(var(--primary-foreground))] shadow-lg hover:opacity-90 active:scale-[0.97] transition-all"
          >
            Launch Active Workspace →
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-[color:hsl(var(--border))]/40 px-6 py-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-3 font-mono text-[10px] text-[color:hsl(var(--text-muted))]">
          <span>© {new Date().getFullYear()} CivicFlow AI · All data processed locally</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:hsl(var(--success))]" />
              CSP Enforced
            </span>
            <span>·</span>
            <span>Zero-Tracking Build</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
