"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function StatsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Stats page error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-[family-name:var(--font-geist-sans)] px-4 pb-12 pt-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="font-[family-name:var(--font-geist-mono)] text-white/30 text-xs tracking-widest uppercase mb-1">
              Personal Tracker
            </p>
            <h1 className="text-2xl font-bold">Stats</h1>
          </div>
          <Link href="/tracker" className="text-sm text-white/40 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-4 py-2 rounded-lg">
            ← Log entry
          </Link>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-8 flex flex-col items-center gap-4 text-center">
          <p className="text-white/30 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest">Something went wrong</p>
          <p className="text-white/50 text-sm max-w-sm">Failed to load stats. This is usually a temporary issue.</p>
          <button
            onClick={reset}
            className="mt-2 px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-lg text-sm transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
