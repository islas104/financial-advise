import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-paper/80 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
      >
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span aria-hidden className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-paper">
            f
          </span>
          financial<span className="text-emerald">·</span>advise
        </Link>
        <Link href="/start" className="text-sm font-medium text-ink-soft transition-colors hover:text-emerald-strong">
          Start &rarr;
        </Link>
      </nav>
    </header>
  );
}
