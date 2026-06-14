import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Best-effort in-memory rate limit + body-size guard for the API (Next.js 16
// proxy convention). Per-instance only — not shared across serverless instances
// — so it caps abuse on a warm instance but is not a hard guarantee. Swap for a
// Redis-backed limiter (e.g. @upstash/ratelimit) before relying on it at scale.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const MAX_TRACKED_KEYS = 10_000;
// The recommend body is ~80 bytes; cap well above that to reject abusive payloads.
const MAX_BODY_BYTES = 4_096;

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

// Trust the platform-injected client IP, not the client-supplied left-most
// X-Forwarded-For entry (which is spoofable).
function clientKey(request: NextRequest): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",").pop()?.trim() ?? "unknown";
}

export function proxy(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { success: false, error: "Request body too large." },
      { status: 413 },
    );
  }

  if (!allow(clientKey(request))) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please slow down and try again shortly." },
      { status: 429 },
    );
  }

  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
