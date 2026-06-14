import { NextResponse } from "next/server";
import { z } from "zod";
import { recommendPortfolio } from "@/lib/portfolio/recommend";
import { getMarketDataProvider, isLiveProvider, topPicks } from "@/lib/market/provider";
import type { MarketSnapshot, RecommendResult } from "@/lib/portfolio/types";
import type { MarketDataProvider } from "@/lib/market/types";

const MAX_ILLUSTRATIVE_PICKS = 3;

const answersSchema = z.object({
  timeHorizon: z.enum(["short", "medium", "long"]),
  riskComfort: z.enum(["cautious", "balanced", "adventurous"]),
  goal: z.enum(["preserve", "balanced", "growth"]),
});

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function buildSnapshot(
  provider: MarketDataProvider,
  tickers: readonly string[],
): Promise<MarketSnapshot> {
  const prices: Record<string, number> = {};
  await Promise.all(
    tickers.map(async (ticker) => {
      const quote = await provider.getQuote(ticker);
      if (quote) prices[ticker] = quote.price;
    }),
  );

  const live = isLiveProvider();
  const asOf = live && provider.asOf ? await provider.asOf() : null;

  return { source: live ? "etoro" : "seed", asOf, prices };
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<RecommendResult>>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = answersSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Please answer all three questions." },
      { status: 422 },
    );
  }

  try {
    const provider = getMarketDataProvider();
    const picks = await topPicks(provider, MAX_ILLUSTRATIVE_PICKS);
    const recommendation = recommendPortfolio(parsed.data, picks);

    const tickers = recommendation.slices
      .map((slice) => slice.ticker)
      .filter((ticker): ticker is string => Boolean(ticker));
    const market = await buildSnapshot(provider, tickers);

    return NextResponse.json({ success: true, data: { recommendation, market } });
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not build a portfolio right now. Please try again." },
      { status: 500 },
    );
  }
}
