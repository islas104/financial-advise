import type { PortfolioRecommendation, RiskBand } from "@/lib/portfolio/types";
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
  onRestart: () => void;
};

export function ResultView({ recommendation, onRestart }: Props) {
  const { riskBand, riskScore, slices, rationale } = recommendation;

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
        <button
          type="button"
          onClick={onRestart}
          className="btn-primary mt-7 self-start"
        >
          Start over
        </button>
      </aside>
    </section>
  );
}
