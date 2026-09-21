"use client";

import { signIn } from "next-auth/react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#060b18] p-4 relative overflow-hidden">
      {/* Subtle Navy Ambient Backlight */}
      <div className="absolute w-[500px] h-[500px] bg-blue-950/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="relative bg-[#080e22]/95 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl p-8 sm:p-10">
          {/* Logo area */}
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white mb-5 shadow-lg overflow-hidden border border-slate-700/40">
              <Image src="/logo.png" alt="BRACU CSE Logo" width={80} height={80} className="w-full h-full object-contain p-2" priority />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
              Faculty Desk Finder
            </h1>
            <p className="text-slate-400 text-sm">
              BRACU CSE Department
            </p>
          </div>

          {/* Sign in button */}
          <div className="mt-8">
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="w-full py-3.5 px-6 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-800/40 py-2.5 px-4 rounded-xl border border-slate-800">
              <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Restricted to emails ending with <strong className="text-slate-200">bracu.ac.bd</strong></span>
            </div>
          </div>
        </div>

        {/* Developer Courtesy */}
        <div className="mt-6 text-center text-xs text-slate-500 font-medium">
          © 2026 - Farhan T. Niloy
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#060b18]">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
