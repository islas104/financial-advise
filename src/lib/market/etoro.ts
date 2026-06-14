import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Constituent, MarketDataProvider, Quote } from "./types";
import { SEED_CONSTITUENTS, SEED_QUOTES } from "./seed-data";

// eToro public API. REST base + the live rates endpoint discovered from the spec.
const BASE = "https://public-api.etoro.com/api/v1";
const RATES_PATH = "/market-data/instruments/rates";
const REQUEST_TIMEOUT_MS = 8000;

// Static ticker -> eToro instrument ID map, resolved once from the instrument
// catalog. Keeping it static avoids shipping the ~12MB catalog fetch at runtime.
const TICKER_TO_ID: Readonly<Record<string, number>> = {
  AAPL: 1001,
  MSFT: 1004,
  NVDA: 1137,
  AMZN: 1005,
  GOOGL: 6434,
  JPM: 1023,
  JNJ: 1022,
  PG: 1029,
  XOM: 1036,
  HD: 1018,
  VOO: 4238,
  BND: 4271,
};

const etoroRateSchema = z.object({
  instrumentID: z.number(),
  ask: z.number().positive(),
  bid: z.number().positive(),
  date: z.string(),
});

const etoroRatesResponseSchema = z.object({
  rates: z.array(etoroRateSchema).default([]),
});

type EtoroRate = z.infer<typeof etoroRateSchema>;

export interface EtoroCredentials {
  readonly apiKey: string;
  readonly userKey: string;
}

/**
 * Live market-data provider backed by eToro's public REST API. Prices come from
 * the rates endpoint (mid of bid/ask). The trailing 12-month change is not
 * exposed by the rates endpoint, so it falls back to seeded reference values —
 * used only to rank illustrative single-stock picks, never shown to users.
 */
export class EtoroMarketProvider implements MarketDataProvider {
  private readonly credentials: EtoroCredentials;
  private ratesCache: Promise<Map<string, EtoroRate>> | null = null;

  constructor(credentials: EtoroCredentials) {
    this.credentials = credentials;
  }

  async listConstituents(): Promise<readonly Constituent[]> {
    return SEED_CONSTITUENTS;
  }

  async getQuote(ticker: string): Promise<Quote | null> {
    const rates = await this.loadRates();
    const rate = rates.get(ticker);
    if (!rate) return null;

    const price = roundMoney((rate.ask + rate.bid) / 2);
    // Live price; change% is a stable reference used only for ranking.
    const oneYearChangePct = SEED_QUOTES[ticker]?.oneYearChangePct ?? 0;
    return { ticker, price, oneYearChangePct };
  }

  /** Timestamp of the most recent live rate, if any have been fetched. */
  async asOf(): Promise<string | null> {
    const rates = await this.loadRates();
    let latest: string | null = null;
    for (const rate of rates.values()) {
      if (!latest || rate.date > latest) latest = rate.date;
    }
    return latest;
  }

  /** Batch-fetch every mapped instrument in a single request, memoised. */
  private loadRates(): Promise<Map<string, EtoroRate>> {
    if (!this.ratesCache) {
      this.ratesCache = this.fetchRates().catch((error: unknown) => {
        this.ratesCache = null; // allow retry on next call
        throw error;
      });
    }
    return this.ratesCache;
  }

  private async fetchRates(): Promise<Map<string, EtoroRate>> {
    const idToTicker = new Map<number, string>(
      Object.entries(TICKER_TO_ID).map(([ticker, id]) => [id, ticker]),
    );
    const ids = Object.values(TICKER_TO_ID).join(",");

    const res = await fetch(`${BASE}${RATES_PATH}?instrumentIds=${ids}`, {
      headers: {
        "x-api-key": this.credentials.apiKey,
        "x-user-key": this.credentials.userKey,
        "x-request-id": randomUUID(),
        accept: "application/json",
      },
      // Live quotes — never cache at the fetch layer.
      cache: "no-store",
      // Fail fast if eToro hangs rather than holding the function open.
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new Error(`eToro rates request failed: HTTP ${res.status} ${res.statusText}`);
    }

    const parsed = etoroRatesResponseSchema.safeParse(await res.json());
    if (!parsed.success) {
      throw new Error("eToro rates response had an unexpected shape");
    }
    if (parsed.data.rates.length === 0) {
      console.warn("[market/etoro] rates response was empty — check instrument IDs and access.");
    }

    const map = new Map<string, EtoroRate>();
    for (const rate of parsed.data.rates) {
      const ticker = idToTicker.get(rate.instrumentID);
      if (ticker) map.set(ticker, rate);
    }
    return map;
  }
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Reads eToro credentials from the environment, or null if not fully set. */
export function etoroCredentialsFromEnv(): EtoroCredentials | null {
  const apiKey = process.env.ETORO_API_KEY;
  const userKey = process.env.ETORO_USER_KEY;
  if (!apiKey || !userKey) return null;
  return { apiKey, userKey };
}
