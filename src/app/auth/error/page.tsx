"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    AccessDenied:
      "Access denied. Only official BRAC University emails ending with bracu.ac.bd are allowed to access this portal.",
    Configuration: "There is a server configuration issue. Please contact support.",
    Default: "An unexpected authentication error occurred.",
  };

  const message = errorMessages[error || ""] || errorMessages.Default;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#060b18] p-4 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-red-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="relative bg-[#080e22]/95 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl p-8 sm:p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-950/80 border border-red-800/50 mb-5 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">{message}</p>

          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Try Again
          </Link>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 font-medium">
          © 2026 - Farhan T. Niloy
        </div>
      </div>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#060b18]">
          <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
