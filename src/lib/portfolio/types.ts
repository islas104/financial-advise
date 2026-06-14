// Domain types for the guided-portfolio (robo-advisor) engine.
// These describe a user's risk profile and the resulting illustrative allocation.
// Nothing here constitutes a personal recommendation — see README disclaimer.

export type TimeHorizon = "short" | "medium" | "long";

export type RiskComfort = "cautious" | "balanced" | "adventurous";

export type Goal = "preserve" | "balanced" | "growth";

export interface RiskProfileAnswers {
  readonly timeHorizon: TimeHorizon;
  readonly riskComfort: RiskComfort;
  readonly goal: Goal;
}

export type RiskBand = "conservative" | "moderate" | "balanced" | "growth" | "aggressive";

export type SliceKind = "index" | "bonds" | "cash" | "equity";

export interface AllocationSlice {
  readonly label: string;
  readonly ticker?: string;
  readonly kind: SliceKind;
  /** Whole-number percentage of the portfolio. All slices sum to 100. */
  readonly percent: number;
}

export interface Projection {
  /** Representative number of years for the chosen time horizon. */
  readonly years: number;
  /** Illustrative (not promised) annual return used for the growth example. */
  readonly assumedAnnualReturnPct: number;
}

export interface PortfolioRecommendation {
  /** 0–100 composite risk score derived from the answers. */
  readonly riskScore: number;
  readonly riskBand: RiskBand;
  readonly slices: readonly AllocationSlice[];
  /** Plain-language explanations the UI can render for transparency. */
  readonly rationale: readonly string[];
  /** Time dimension: horizon length + an illustrative growth assumption. */
  readonly projection: Projection;
}

export type MarketDataSource = "etoro" | "seed";

export interface MarketSnapshot {
  readonly source: MarketDataSource;
  /** ISO timestamp of the live data, or null for seeded reference data. */
  readonly asOf: string | null;
  /** Current price per ticker, keyed by symbol. */
  readonly prices: Readonly<Record<string, number>>;
}

export interface RecommendResult {
  readonly recommendation: PortfolioRecommendation;
  readonly market: MarketSnapshot;
}
