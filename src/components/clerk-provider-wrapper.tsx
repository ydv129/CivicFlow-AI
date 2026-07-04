"use client";

import React, { useState, useEffect } from "react";
import { ClerkProvider } from "@clerk/react";

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ""}>
      {children}
    </ClerkProvider>
  );
}
