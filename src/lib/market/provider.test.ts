import { describe, it, expect } from "vitest";
import { SeedMarketProvider, topPicks } from "./provider";

describe("SeedMarketProvider", () => {
  const provider = new SeedMarketProvider();

  it("lists S&P 500 constituents", async () => {
    const constituents = await provider.listConstituents();
    expect(constituents.length).toBeGreaterThan(0);
    expect(constituents[0]).toMatchObject({
      ticker: expect.any(String),
      name: expect.any(String),
      sector: expect.any(String),
    });
  });

  it("returns a quote for a known ticker", async () => {
    const quote = await provider.getQuote("AAPL");
    expect(quote?.ticker).toBe("AAPL");
    expect(quote?.price).toBeGreaterThan(0);
  });

  it("returns null for an unknown ticker", async () => {
    expect(await provider.getQuote("NOPE")).toBeNull();
  });
});

describe("topPicks", () => {
  it("returns the requested count, ranked by 1-year change descending", async () => {
    const provider = new SeedMarketProvider();
    const picks = await topPicks(provider, 3);
    expect(picks).toHaveLength(3);

    const changes = await Promise.all(
      picks.map(async (pick) => {
        const quote = await provider.getQuote(pick.ticker);
        return quote?.oneYearChangePct ?? 0;
      }),
    );
    expect(changes[0]).toBeGreaterThanOrEqual(changes[1]);
    expect(changes[1]).toBeGreaterThanOrEqual(changes[2]);
  });

  it("never returns more picks than exist", async () => {
    const provider = new SeedMarketProvider();
    const constituents = await provider.listConstituents();
    const picks = await topPicks(provider, constituents.length + 50);
    expect(picks.length).toBeLessThanOrEqual(constituents.length);
  });
});
