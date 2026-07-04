import SignInComponent from "@/components/sign-in-component";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:hsl(var(--background))] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 flex flex-col items-center">
        <div className="flex flex-col items-center space-y-2 font-mono text-sm tracking-widest font-extrabold uppercase mb-4">
          <span className="h-2.5 w-2.5 rounded-full bg-[color:hsl(var(--primary))]" />
          <span>CivicFlow AI Gateway</span>
        </div>
        <SignInComponent />
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return [{ "sign-in": [] }];
}
