import { describe, it, expect } from "vitest";
import { recommendPortfolio } from "./recommend";
import type { AllocationSlice, Goal, RiskComfort, RiskProfileAnswers, TimeHorizon } from "./types";

const PICKS = [
  { ticker: "NVDA", name: "NVIDIA" },
  { ticker: "AMZN", name: "Amazon" },
  { ticker: "GOOGL", name: "Alphabet" },
];

const HORIZONS: TimeHorizon[] = ["short", "medium", "long"];
const COMFORTS: RiskComfort[] = ["cautious", "balanced", "adventurous"];
const GOALS: Goal[] = ["preserve", "balanced", "growth"];

function sum(slices: readonly AllocationSlice[]): number {
  return slices.reduce((total, slice) => total + slice.percent, 0);
}

describe("recommendPortfolio", () => {
  it("maps the most cautious answers to the conservative band", () => {
    const answers: RiskProfileAnswers = {
      timeHorizon: "short",
      riskComfort: "cautious",
      goal: "preserve",
    };
    const result = recommendPortfolio(answers, PICKS);
    expect(result.riskBand).toBe("conservative");
    expect(result.riskScore).toBeLessThanOrEqual(20);
  });

  it("maps the most adventurous answers to the aggressive band", () => {
    const answers: RiskProfileAnswers = {
      timeHorizon: "long",
      riskComfort: "adventurous",
      goal: "growth",
    };
    const result = recommendPortfolio(answers, PICKS);
    expect(result.riskBand).toBe("aggressive");
    expect(result.riskScore).toBe(100);
  });

  it("always produces slices that sum to exactly 100% (every profile)", () => {
    for (const timeHorizon of HORIZONS) {
      for (const riskComfort of COMFORTS) {
        for (const goal of GOALS) {
          const result = recommendPortfolio({ timeHorizon, riskComfort, goal }, PICKS);
          expect(sum(result.slices), `${timeHorizon}/${riskComfort}/${goal}`).toBe(100);
        }
      }
    }
  });

  it("always includes a broad S&P 500 index core", () => {
    const result = recommendPortfolio(
      { timeHorizon: "medium", riskComfort: "balanced", goal: "balanced" },
      PICKS,
    );
    expect(result.slices.some((s) => s.kind === "index" && s.ticker === "VOO")).toBe(true);
  });

  it("does not add single-stock tilts for the lowest risk band", () => {
    const result = recommendPortfolio(
      { timeHorizon: "short", riskComfort: "cautious", goal: "preserve" },
      PICKS,
    );
    expect(result.slices.some((s) => s.kind === "equity")).toBe(false);
  });

  it("adds only supplied picks as single-stock tilts for higher risk bands", () => {
    const result = recommendPortfolio(
      { timeHorizon: "long", riskComfort: "adventurous", goal: "growth" },
      PICKS,
    );
    const equities = result.slices.filter((s) => s.kind === "equity");
    expect(equities.length).toBeGreaterThan(0);
    expect(equities.every((s) => PICKS.some((p) => p.ticker === s.ticker))).toBe(true);
  });

  it("still sums to 100% with no picks (folds the tilt into the index core)", () => {
    const result = recommendPortfolio(
      { timeHorizon: "long", riskComfort: "adventurous", goal: "growth" },
      [],
    );
    expect(sum(result.slices)).toBe(100);
    expect(result.slices.some((s) => s.kind === "equity")).toBe(false);
  });

  it("returns rationale that includes a not-a-recommendation disclaimer", () => {
    const result = recommendPortfolio(
      { timeHorizon: "medium", riskComfort: "balanced", goal: "balanced" },
      PICKS,
    );
    expect(result.rationale.length).toBeGreaterThan(0);
    expect(result.rationale.some((line) => /not a personal recommendation/i.test(line))).toBe(true);
  });

  it("scores higher risk comfort above lower risk comfort", () => {
    const cautious = recommendPortfolio({
      timeHorizon: "medium",
      riskComfort: "cautious",
      goal: "balanced",
    }).riskScore;
    const adventurous = recommendPortfolio({
      timeHorizon: "medium",
      riskComfort: "adventurous",
      goal: "balanced",
    }).riskScore;
    expect(adventurous).toBeGreaterThan(cautious);
  });

  it("keeps the risk score within 0–100", () => {
    for (const timeHorizon of HORIZONS) {
      for (const riskComfort of COMFORTS) {
        for (const goal of GOALS) {
          const { riskScore } = recommendPortfolio({ timeHorizon, riskComfort, goal });
          expect(riskScore).toBeGreaterThanOrEqual(0);
          expect(riskScore).toBeLessThanOrEqual(100);
        }
      }
    }
  });
});
