import { NextResponse } from "next/server";
import { z } from "zod";
import { recommendPortfolio } from "@/lib/portfolio/recommend";
import { getMarketDataProvider, topPicks } from "@/lib/market/provider";
import type { PortfolioRecommendation } from "@/lib/portfolio/types";

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

export async function POST(request: Request): Promise<NextResponse<ApiResponse<PortfolioRecommendation>>> {
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
    return NextResponse.json({ success: true, data: recommendation });
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not build a portfolio right now. Please try again." },
      { status: 500 },
    );
  }
}
