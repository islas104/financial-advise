// Market-data abstraction. The app depends on this interface, not on any
// specific vendor, so we can start on seeded data and swap to a live free-tier
// API (e.g. Financial Modeling Prep) by adding one adapter.

export interface Constituent {
  readonly ticker: string;
  readonly name: string;
  readonly sector: string;
}

export interface Quote {
  readonly ticker: string;
  readonly price: number;
  /** Percentage change over the trailing 12 months. */
  readonly oneYearChangePct: number;
}

export interface MarketDataProvider {
  /** Curated S&P 500 large-caps available for illustrative single-stock tilts. */
  listConstituents(): Promise<readonly Constituent[]>;
  getQuote(ticker: string): Promise<Quote | null>;
}
