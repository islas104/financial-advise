import type {
  AllocationSlice,
  PortfolioRecommendation,
  RiskBand,
  RiskProfileAnswers,
  TimeHorizon,
} from "./types";

// Scoring weights. Each answer contributes points toward a 0–100 risk score.
// Kept as named constants so the model is auditable rather than magic numbers.
const HORIZON_POINTS = { short: 5, medium: 20, long: 35 } as const;
const COMFORT_POINTS = { cautious: 5, balanced: 20, adventurous: 35 } as const;
const GOAL_POINTS = { preserve: 5, balanced: 18, growth: 30 } as const;

const MAX_SCORE =
  HORIZON_POINTS.long + COMFORT_POINTS.adventurous + GOAL_POINTS.growth;

/** Illustrative core index holding (broad S&P 500 exposure). */
const INDEX_TICKER = "VOO";

interface BandRule {
  readonly band: RiskBand;
  /** Inclusive upper bound of the normalised 0–100 score for this band. */
  readonly maxScore: number;
  /** equity / bonds / cash split before any single-stock tilt. */
  readonly equity: number;
  readonly bonds: number;
  readonly cash: number;
  /** Share of the equity sleeve allocated to illustrative single stocks. */
  readonly singleStockShare: number;
}

const BAND_RULES: readonly BandRule[] = [
  { band: "conservative", maxScore: 20, equity: 30, bonds: 50, cash: 20, singleStockShare: 0 },
  { band: "moderate", maxScore: 40, equity: 50, bonds: 38, cash: 12, singleStockShare: 0 },
  { band: "balanced", maxScore: 60, equity: 65, bonds: 28, cash: 7, singleStockShare: 0.1 },
  { band: "growth", maxScore: 80, equity: 80, bonds: 15, cash: 5, singleStockShare: 0.15 },
  { band: "aggressive", maxScore: 100, equity: 90, bonds: 7, cash: 3, singleStockShare: 0.2 },
];

function normaliseScore(answers: RiskProfileAnswers): number {
  const raw =
    HORIZON_POINTS[answers.timeHorizon] +
    COMFORT_POINTS[answers.riskComfort] +
    GOAL_POINTS[answers.goal];
  return Math.round((raw / MAX_SCORE) * 100);
}

function ruleForScore(score: number): BandRule {
  return BAND_RULES.find((rule) => score <= rule.maxScore) ?? BAND_RULES.at(-1)!;
}

/**
 * Build the allocation slices for a band. The equity sleeve is split between a
 * broad S&P 500 index core and (for higher risk bands) a few illustrative
 * large-cap picks supplied by the caller.
 */
function buildSlices(rule: BandRule, picks: readonly { ticker: string; name: string }[]): AllocationSlice[] {
  const singleStockTotal = Math.round(rule.equity * rule.singleStockShare);
  const indexEquity = rule.equity - singleStockTotal;

  const slices: AllocationSlice[] = [
    { label: "S&P 500 index core", ticker: INDEX_TICKER, kind: "index", percent: indexEquity },
  ];

  if (singleStockTotal > 0 && picks.length > 0) {
    const per = Math.floor(singleStockTotal / picks.length);
    let remainder = singleStockTotal - per * picks.length;
    for (const pick of picks) {
      const bonus = remainder > 0 ? 1 : 0;
      remainder -= bonus;
      slices.push({ label: pick.name, ticker: pick.ticker, kind: "equity", percent: per + bonus });
    }
  }

  if (rule.bonds > 0) {
    slices.push({ label: "Bonds (stability)", ticker: "BND", kind: "bonds", percent: rule.bonds });
  }
  if (rule.cash > 0) {
    slices.push({ label: "Cash buffer", kind: "cash", percent: rule.cash });
  }

  return slices;
}

const HORIZON_TEXT: Record<TimeHorizon, string> = {
  long: "a long time horizon lets the portfolio ride out short-term swings",
  medium: "a medium time horizon balances growth with some stability",
  short: "a short time horizon means capital preservation matters more than growth",
};

function buildRationale(answers: RiskProfileAnswers, rule: BandRule): string[] {
  const horizonText = HORIZON_TEXT[answers.timeHorizon];

  return [
    `Your answers map to the "${rule.band}" risk band.`,
    `${rule.equity}% sits in equities for growth, with ${rule.bonds}% in bonds and ${rule.cash}% in cash for stability.`,
    `The equity core uses a broad S&P 500 index fund (${INDEX_TICKER}) rather than concentrated bets.`,
    `Reasoning: ${horizonText}.`,
    "This is an illustrative example for learning, not a personal recommendation.",
  ];
}

/**
 * Pure function: maps risk-profile answers to an illustrative portfolio.
 * `picks` are optional illustrative large-caps used only in higher risk bands.
 */
export function recommendPortfolio(
  answers: RiskProfileAnswers,
  picks: readonly { ticker: string; name: string }[] = [],
): PortfolioRecommendation {
  const riskScore = normaliseScore(answers);
  const rule = ruleForScore(riskScore);
  const slices = buildSlices(rule, picks);

  return {
    riskScore,
    riskBand: rule.band,
    slices,
    rationale: buildRationale(answers, rule),
  };
}
