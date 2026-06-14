import type { Constituent, MarketDataProvider, Quote } from "./types";
import { SEED_CONSTITUENTS, SEED_QUOTES } from "./seed-data";

/**
 * Default provider backed by seeded reference data. Works offline and with no
 * API key so the app runs end-to-end today. Swap to a live adapter by
 * implementing MarketDataProvider against a free-tier API.
 */
export class SeedMarketProvider implements MarketDataProvider {
  async listConstituents(): Promise<readonly Constituent[]> {
    return SEED_CONSTITUENTS;
  }

  async getQuote(ticker: string): Promise<Quote | null> {
    return SEED_QUOTES[ticker] ?? null;
  }
}

let cached: MarketDataProvider | null = null;

/**
 * Provider factory. Reads MARKET_DATA_PROVIDER from the environment so a live
 * adapter can be introduced later without touching call sites. Defaults to the
 * seeded provider.
 */
export function getMarketDataProvider(): MarketDataProvider {
  if (cached) return cached;
  // Future: switch on process.env.MARKET_DATA_PROVIDER === "fmp" etc.
  cached = new SeedMarketProvider();
  return cached;
}

/** Top illustrative large-caps by trailing 12-month change, for higher risk tilts. */
export async function topPicks(
  provider: MarketDataProvider,
  limit: number,
): Promise<readonly { ticker: string; name: string }[]> {
  const constituents = await provider.listConstituents();
  const quoted = await Promise.all(
    constituents.map(async (c) => ({
      constituent: c,
      quote: await provider.getQuote(c.ticker),
    })),
  );

  return quoted
    .filter((entry) => entry.quote !== null)
    .sort((a, b) => (b.quote!.oneYearChangePct ?? 0) - (a.quote!.oneYearChangePct ?? 0))
    .slice(0, limit)
    .map((entry) => ({ ticker: entry.constituent.ticker, name: entry.constituent.name }));
}
