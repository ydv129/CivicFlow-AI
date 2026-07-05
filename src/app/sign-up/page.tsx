import SignUpComponent from "@/components/sign-up-component";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[color:hsl(var(--background))] p-4">
      <Link href="/" className="absolute top-8 left-8 font-mono text-xs text-[color:hsl(var(--text-muted))] hover:text-[color:hsl(var(--text-primary))]">
        ← Back to Home
      </Link>
      <SignUpComponent />
    </div>
  );
}
