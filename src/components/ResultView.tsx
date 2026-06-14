import type { MarketSnapshot, PortfolioRecommendation, RiskBand } from "@/lib/portfolio/types";
import { AllocationBar } from "./AllocationBar";

const BAND_LABEL: Record<RiskBand, string> = {
  conservative: "Conservative",
  moderate: "Moderate",
  balanced: "Balanced",
  growth: "Growth",
  aggressive: "Aggressive",
};

type Props = {
  recommendation: PortfolioRecommendation;
  market: MarketSnapshot;
  onRestart: () => void;
};

function formatPrice(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatAsOf(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ResultView({ recommendation, market, onRestart }: Props) {
  const { riskBand, riskScore, slices, rationale } = recommendation;
  const isLive = market.source === "etoro";
  const pricedSlices = slices.filter((slice) => slice.ticker && market.prices[slice.ticker]);

  return (
    <section aria-live="polite" className="grid gap-6 md:grid-cols-5">
      <div className="surface p-7 md:col-span-3">
        <p className="eyebrow">Your illustrative starter portfolio</p>
        <div className="mt-3 flex items-baseline gap-3">
          <h2 className="text-3xl font-semibold tracking-tight">{BAND_LABEL[riskBand]}</h2>
          <span className="font-mono text-sm text-muted">risk score {riskScore}/100</span>
        </div>
        <div className="mt-6">
          <AllocationBar slices={slices} />
        </div>
      </div>

      <aside className="surface flex flex-col p-7 md:col-span-2">
        <p className="eyebrow">Why this mix</p>
        <ul className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
          {rationale.map((line) => (
            <li key={line} className="flex gap-2.5">
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <button type="button" onClick={onRestart} className="btn-primary mt-7 self-start">
          Start over
        </button>
      </aside>

      {pricedSlices.length > 0 ? (
        <div className="surface p-7 md:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow">Current prices</p>
            <span className="flex items-center gap-2 text-xs text-muted">
              {isLive ? (
                <>
                  <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-emerald" />
                  Live · eToro{market.asOf ? ` · ${formatAsOf(market.asOf)}` : ""}
                </>
              ) : (
                "Reference data (not live)"
              )}
            </span>
          </div>
          <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {pricedSlices.map((slice) => (
              <li
                key={slice.ticker}
                className="flex items-baseline justify-between border-b border-line/70 py-1.5"
              >
                <span className="text-sm">
                  <span className="font-mono text-xs text-muted">{slice.ticker}</span>{" "}
                  <span className="text-ink-soft">{slice.label}</span>
                </span>
                <span className="font-mono tabular-nums text-ink">
                  {formatPrice(market.prices[slice.ticker as string])}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
