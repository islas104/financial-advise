import "server-only";
import type { Constituent, MarketDataProvider, Quote } from "./types";
import { SEED_CONSTITUENTS, SEED_QUOTES } from "./seed-data";
import { EtoroMarketProvider, etoroCredentialsFromEnv } from "./etoro";

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

  if (process.env.MARKET_DATA_PROVIDER === "etoro") {
    const credentials = etoroCredentialsFromEnv();
    if (credentials) {
      cached = new EtoroMarketProvider(credentials);
      return cached;
    }
    // Misconfigured: asked for eToro but no keys. Fall back to seed data, but
    // make the regression visible in logs instead of silently serving stale prices.
    console.warn(
      "[market/provider] MARKET_DATA_PROVIDER=etoro but ETORO_API_KEY/ETORO_USER_KEY " +
        "are missing. Falling back to seed data — prices shown will NOT be live.",
    );
  }

  cached = new SeedMarketProvider();
  return cached;
}

/** True when live eToro pricing is active for this process. */
export function isLiveProvider(): boolean {
  return getMarketDataProvider() instanceof EtoroMarketProvider;
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
    .filter((entry): entry is { constituent: Constituent; quote: Quote } => entry.quote !== null)
    .sort((a, b) => b.quote.oneYearChangePct - a.quote.oneYearChangePct)
    .slice(0, limit)
    .map((entry) => ({ ticker: entry.constituent.ticker, name: entry.constituent.name }));
}
