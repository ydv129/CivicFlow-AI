"use client";

import { useState, useEffect } from "react";
import { SignIn } from "@clerk/react";

export default function SignInComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full max-w-md h-[400px] border border-[color:hsl(var(--border))] bg-[color:hsl(var(--surface))] rounded-lg flex items-center justify-center font-mono text-xs text-[color:hsl(var(--text-muted))] shadow-xl">
        <span className="animate-spin h-4 w-4 border-2 border-[color:hsl(var(--primary))] border-t-transparent rounded-full mr-2" />
        Loading local secure forms...
      </div>
    );
  }

  return (
    <SignIn
      appearance={{
        variables: {
          colorPrimary: "hsl(221.2, 83.2%, 53.3%)",
          colorBackground: "hsl(240, 10%, 5.9%)",
          colorForeground: "hsl(240, 5%, 96%)",
          colorMutedForeground: "hsl(240, 5%, 64.9%)",
          colorBorder: "hsl(240, 3.7%, 15.9%)",
        },
        elements: {
          card: "border border-[color:hsl(var(--border))] bg-[color:hsl(var(--surface))] shadow-xl rounded-lg",
          headerTitle: "font-mono font-bold tracking-tight text-lg text-[color:hsl(var(--text-primary))]",
          headerSubtitle: "font-mono text-xs text-[color:hsl(var(--text-muted))]",
          socialButtonsBlockButton: "border border-[color:hsl(var(--border))] bg-[color:hsl(var(--surface))] font-mono text-xs text-[color:hsl(var(--text-primary))] hover:bg-[color:hsl(var(--background))]",
          formButtonPrimary: "bg-[color:hsl(var(--primary))] font-mono text-xs text-[color:hsl(var(--primary-foreground))] hover:opacity-90 shadow-sm",
          footerActionLink: "text-[color:hsl(var(--primary))] hover:text-opacity-80 font-mono text-xs",
        },
      }}
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
    />
  );
}
