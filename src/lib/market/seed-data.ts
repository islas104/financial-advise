import type { Constituent, Quote } from "./types";

// Seeded reference data for a curated set of well-known S&P 500 large-caps.
// Used so the app works end-to-end before a live API key is added. Figures are
// illustrative reference values, not live quotes.

export const SEED_CONSTITUENTS: readonly Constituent[] = [
  { ticker: "AAPL", name: "Apple", sector: "Technology" },
  { ticker: "MSFT", name: "Microsoft", sector: "Technology" },
  { ticker: "NVDA", name: "NVIDIA", sector: "Technology" },
  { ticker: "AMZN", name: "Amazon", sector: "Consumer Discretionary" },
  { ticker: "GOOGL", name: "Alphabet", sector: "Communication Services" },
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Financials" },
  { ticker: "JNJ", name: "Johnson & Johnson", sector: "Health Care" },
  { ticker: "PG", name: "Procter & Gamble", sector: "Consumer Staples" },
  { ticker: "XOM", name: "Exxon Mobil", sector: "Energy" },
  { ticker: "HD", name: "Home Depot", sector: "Consumer Discretionary" },
];

export const SEED_QUOTES: Readonly<Record<string, Quote>> = {
  AAPL: { ticker: "AAPL", price: 212.4, oneYearChangePct: 12.1 },
  MSFT: { ticker: "MSFT", price: 438.2, oneYearChangePct: 18.5 },
  NVDA: { ticker: "NVDA", price: 121.8, oneYearChangePct: 41.3 },
  AMZN: { ticker: "AMZN", price: 198.6, oneYearChangePct: 22.7 },
  GOOGL: { ticker: "GOOGL", price: 176.9, oneYearChangePct: 19.2 },
  JPM: { ticker: "JPM", price: 204.5, oneYearChangePct: 19.0 },
  JNJ: { ticker: "JNJ", price: 153.1, oneYearChangePct: 4.4 },
  PG: { ticker: "PG", price: 168.7, oneYearChangePct: 8.9 },
  XOM: { ticker: "XOM", price: 113.2, oneYearChangePct: 6.1 },
  HD: { ticker: "HD", price: 352.0, oneYearChangePct: 9.8 },
  VOO: { ticker: "VOO", price: 512.3, oneYearChangePct: 14.6 },
  BND: { ticker: "BND", price: 72.4, oneYearChangePct: 2.3 },
};
