import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Best-effort in-memory rate limit for the API surface (Next.js 16 proxy
// convention). Per-instance only — not shared across serverless instances — so
// it caps abuse on a warm instance but is not a hard guarantee. Swap for a
// Redis-backed limiter (e.g. @upstash/ratelimit) before relying on it at scale.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const MAX_TRACKED_KEYS = 10_000;

interface Hit {
  count: number;
  resetAt: number;
}

const hits = new Map<string, Hit>();

function allow(key: string): boolean {
  const now = Date.now();

  // Opportunistic cleanup so the map cannot grow unbounded.
  if (hits.size > MAX_TRACKED_KEYS) {
    for (const [k, v] of hits) {
      if (now > v.resetAt) hits.delete(k);
    }
  }

  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count += 1;
  return true;
}

export function proxy(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please slow down and try again shortly." },
      { status: 429 },
    );
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
