import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(
    appUrl.startsWith("http") ? appUrl : `https://${appUrl}`
  ),
  title: {
    default: "CivicFlow AI — Local Spreadsheet Analytics",
    template: "%s | CivicFlow AI",
  },
  description:
    "Privacy-first, 100% client-side spreadsheet analytics powered by WebGPU and local AI. No server uploads. No API keys. Your data never leaves the browser.",
  keywords: [
    "spreadsheet analytics",
    "local AI",
    "WebGPU",
    "privacy first",
    "offline AI",
    "Gemma 2B",
    "CSV analysis",
    "Excel analysis",
    "client-side AI",
  ],
  authors: [{ name: "CivicFlow AI" }],
  creator: "CivicFlow AI",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "CivicFlow AI — Local Spreadsheet Analytics",
    description:
      "Privacy-first, 100% client-side spreadsheet analytics. No uploads. No API keys. WebGPU-powered.",
    siteName: "CivicFlow AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "CivicFlow AI — Local Spreadsheet Analytics",
    description: "Privacy-first, 100% client-side spreadsheet analytics powered by WebGPU and local AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-[color:hsl(var(--background))] text-[color:hsl(var(--text-primary))]`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
