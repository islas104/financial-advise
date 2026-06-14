import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const STEPS = [
  {
    n: "01",
    title: "Answer three questions",
    body: "Your time horizon, how you feel about risk, and what this money is for. About 30 seconds.",
  },
  {
    n: "02",
    title: "Get a simple mix",
    body: "We map your answers to a clear allocation built around a broad S&P 500 index core — no jargon, no 50-stock spreadsheet.",
  },
  {
    n: "03",
    title: "Understand the why",
    body: "Every portfolio comes with plain-language reasoning you can take away and research yourself.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section
          aria-labelledby="hero-heading"
          className="grain relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24"
        >
          <div>
            <p className="eyebrow">Investing, minus the intimidation</p>
            <h1
              id="hero-heading"
              className="mt-4 text-balance text-5xl font-semibold leading-[1.04] tracking-tight md:text-7xl"
            >
              Know where to <span className="text-emerald-strong">start</span>.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              The way eToro and Trading&nbsp;212 made buying shares simple — we do that for the
              decision before it: <em>what</em> to actually put your money in.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/start" className="btn-primary text-base">
                Build my portfolio &rarr;
              </Link>
              <span className="text-sm text-muted">Free · no sign-up</span>
            </div>
            <p className="mt-8 max-w-md text-xs leading-relaxed text-muted">
              Educational only — not financial advice. Capital at risk.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[28px] bg-emerald/10 blur-2xl" aria-hidden />
            <Image
              src="/hero.png"
              alt="Abstract illustration of a steadily rising market in emerald and gold"
              width={2336}
              height={1744}
              priority
              sizes="(max-width: 768px) 90vw, 560px"
              className="rounded-[22px] border border-line shadow-[var(--shadow-lg)]"
            />
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-heading" className="border-y border-line bg-paper-2/40">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 id="how-heading" className="max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
              Three questions stand between you and a starting point.
            </h2>
            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.n} className="bg-card p-8">
                  <span className="font-mono text-sm text-gold">{step.n}</span>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section aria-labelledby="cta-heading" className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h2
            id="cta-heading"
            className="mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-tight md:text-5xl"
          >
            Stop overthinking your first move.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-ink-soft">
            A clear, explainable starting portfolio in under a minute.
          </p>
          <Link href="/start" className="btn-primary mt-9 text-base">
            Get started &rarr;
          </Link>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
