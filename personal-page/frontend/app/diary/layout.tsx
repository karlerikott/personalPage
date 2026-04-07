import Link from "next/link";

export default function DiaryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="fixed top-0 w-full z-10 px-8 py-5 flex items-center justify-between border-b border-white/5 bg-[#161032]/90 backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-[family-name:var(--font-geist-mono)] tracking-widest uppercase text-xs">KEO</span>
        </Link>
        <span className="font-[family-name:var(--font-geist-mono)] text-white/20 text-xs tracking-widest uppercase">
          Journal
        </span>
      </nav>
      <div className="pt-[73px]">{children}</div>
    </>
  );
}
