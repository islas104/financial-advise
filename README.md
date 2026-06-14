# financial-advise

Beginner-friendly web app that turns your risk profile and goals into a simple,
S&P 500-based starter portfolio — inspired by how eToro and Trading 212 make
investing approachable. Live prices come from the eToro public API.

**Live:** https://financial-advise.vercel.app

> ⚠️ **Educational only — not financial advice.** This app produces illustrative,
> general-information portfolios for learning purposes. It is **not** a personal
> recommendation and is **not** provided by an FCA-authorised firm. The output is
> generic guidance, not a regulated personal recommendation. Always do your own
> research and consider speaking to a regulated adviser before investing.
> Investing carries risk; you may get back less than you put in.

---

## What it does

1. You answer three short questions — time horizon, risk comfort, and goal.
2. A scoring model maps your answers to a risk band (`conservative` →
   `aggressive`) and a matching allocation built around a broad **S&P 500 index
   core** (VOO), with bonds, a cash buffer, and — for higher risk bands — a few
   illustrative large-cap tilts.
3. You get a clear breakdown with plain-language reasoning and **live prices**
   for each holding.

The recommendation engine (`src/lib/portfolio/recommend.ts`) is a set of pure,
deterministic functions — no machine learning, no hidden state — so every output
is explainable and testable.

---

## Tech stack

- **Next.js 16 (App Router, Turbopack)** + TypeScript
- **Tailwind CSS v4**
- **Zod** for input validation at every boundary
- Pluggable market-data layer: seeded reference data **or** live eToro REST
- Hero visual generated with [Higgsfield](https://higgsfield.ai)
- Deployed on **Vercel**

---

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — runs on seed data without it
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With no `.env.local`, the app
runs end-to-end on built-in S&P 500 reference data.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (also type-checks and lints) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run etoro:check` | Verify eToro credentials against the live API |

---

## Market data

The app depends on the `MarketDataProvider` interface
(`src/lib/market/types.ts`), not on any specific vendor. Two implementations
ship:

| Provider | Source | When used |
|---|---|---|
| `SeedMarketProvider` | Built-in reference data (`src/lib/market/seed-data.ts`) | Default — no keys needed |
| `EtoroMarketProvider` | Live eToro REST (`/market-data/instruments/rates`) | When `MARKET_DATA_PROVIDER=etoro` **and** both keys are set |

Selection happens in `getMarketDataProvider()`. If `MARKET_DATA_PROVIDER=etoro`
is set but credentials are missing, the app logs a warning and falls back to seed
data (so it never crashes — but prices will **not** be live).

Live prices are fetched for all holdings in a **single batched request** and
memoised per process. Ticker → eToro instrument IDs are mapped statically in
`src/lib/market/etoro.ts` (e.g. `AAPL → 1001`, `VOO → 4238`).

### eToro credentials

The eToro public API needs **two** credentials, both issued in the
[developer portal](https://api-portal.etoro.com/):

- `ETORO_API_KEY` — the **opaque** key (not a token).
- `ETORO_USER_KEY` — the **base64 token** (starts with `eyJ…`).

Verify them any time with:

```bash
npm run etoro:check
```

> **Gotcha — IP allowlist:** eToro tokens can be IP-restricted. Vercel functions
> egress from dynamic IPs, so an IP-restricted token returns `401` in production
> even when correct. Use a token **without** an IP allowlist (or a static-egress
> setup).

---

## Environment variables

Set these in `.env.local` (local) and in **Vercel → Settings → Environment
Variables** (production). `.env.local` is gitignored and never deployed.

| Variable | Required | Description |
|---|---|---|
| `MARKET_DATA_PROVIDER` | No | `seed` (default) or `etoro` |
| `ETORO_API_KEY` | Only for `etoro` | Opaque eToro API key |
| `ETORO_USER_KEY` | Only for `etoro` | eToro user key (`eyJ…` token) |

After changing env vars in Vercel you must **redeploy** for them to take effect.

---

## API

### `POST /api/recommend`

**Request body** (all required):

```json
{ "timeHorizon": "short|medium|long",
  "riskComfort": "cautious|balanced|adventurous",
  "goal": "preserve|balanced|growth" }
```

**Response** (`200`):

```json
{
  "success": true,
  "data": {
    "recommendation": { "riskScore": 58, "riskBand": "balanced", "slices": [ … ], "rationale": [ … ] },
    "market": { "source": "etoro", "asOf": "2026-06-12T19:59:55Z", "prices": { "VOO": 682.19, … } }
  }
}
```

Errors return `{ "success": false, "error": "…" }` with `400` (bad JSON), `422`
(invalid answers), `413` (body too large), `429` (rate limited), or `500`.

---

## Security

- **Secrets** live only in `.env.local` / Vercel env, never in the bundle.
  `src/lib/market/*` import `server-only` so credentials can't leak to the client.
- **Input validation** with Zod on the request body and on the eToro response.
- **Security headers** (`next.config.ts`): HSTS, CSP, `X-Frame-Options: DENY`,
  `nosniff`, Referrer-Policy, Permissions-Policy.
- **Rate limiting + body cap** (`src/proxy.ts`): 20 req/min per client IP and a
  4 KB request-body limit on the API. The limiter is in-memory/per-instance —
  swap for [`@upstash/ratelimit`](https://github.com/upstash/ratelimit) for
  distributed correctness at scale.
- **Fetch timeout** on outbound eToro calls so a hung upstream fails fast.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Landing page (hero, how-it-works, CTA)
│   ├── start/page.tsx        # Questionnaire flow
│   └── api/recommend/route.ts# Recommendation + live-price endpoint
├── components/               # Questionnaire, ResultView, AllocationBar, …
├── lib/
│   ├── portfolio/            # Pure recommendation engine + question config
│   └── market/               # Provider interface, seed data, eToro adapter
└── proxy.ts                  # Rate limit + body-size guard for /api
scripts/etoro-check.mjs       # Credential checker
```

---

## Deployment

Pushes to `main` auto-deploy to Vercel. Before live data works in production,
set `MARKET_DATA_PROVIDER`, `ETORO_API_KEY`, and `ETORO_USER_KEY` in the Vercel
project and redeploy. Without them the production app falls back to seed data.
