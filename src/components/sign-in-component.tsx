"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth!, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to sign in.");
      } else {
        setError("Failed to sign in.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth!, provider);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to sign in with Google.");
      } else {
        setError("Failed to sign in with Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md border border-[color:hsl(var(--border))] bg-[color:hsl(var(--surface))] rounded-lg shadow-xl p-6">
      <div className="mb-6">
        <h2 className="font-mono font-bold tracking-tight text-lg text-[color:hsl(var(--text-primary))]">Sign In</h2>
        <p className="font-mono text-xs text-[color:hsl(var(--text-muted))]">to continue to CivicFlow AI</p>
      </div>
      
      {error && <div className="mb-4 text-xs font-mono text-red-500 bg-red-500/10 p-2 rounded">{error}</div>}

      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <div>
          <label className="block font-mono text-[10px] uppercase text-[color:hsl(var(--text-muted))] mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[color:hsl(var(--background))] border border-[color:hsl(var(--border))] rounded px-3 py-2 text-xs font-mono text-[color:hsl(var(--text-primary))] focus:outline-none focus:border-[color:hsl(var(--primary))]"
            required
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase text-[color:hsl(var(--text-muted))] mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[color:hsl(var(--background))] border border-[color:hsl(var(--border))] rounded px-3 py-2 text-xs font-mono text-[color:hsl(var(--text-primary))] focus:outline-none focus:border-[color:hsl(var(--primary))]"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[color:hsl(var(--primary))] text-[color:hsl(var(--primary-foreground))] font-mono text-xs py-2 rounded hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? "Signing In..." : "Continue"}
        </button>
      </form>

      <div className="my-4 flex items-center">
        <div className="flex-1 border-t border-[color:hsl(var(--border))]"></div>
        <span className="mx-4 font-mono text-[10px] text-[color:hsl(var(--text-muted))]">OR</span>
        <div className="flex-1 border-t border-[color:hsl(var(--border))]"></div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full bg-[color:hsl(var(--surface))] border border-[color:hsl(var(--border))] text-[color:hsl(var(--text-primary))] font-mono text-xs py-2 rounded hover:bg-[color:hsl(var(--background))] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <div className="mt-6 text-center font-mono text-[10px] text-[color:hsl(var(--text-muted))]">
        No account? <Link href="/sign-up" className="text-[color:hsl(var(--primary))] hover:underline">Sign up</Link>
      </div>
    </div>
  );
}
