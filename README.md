# financial-advise

Beginner-friendly web app that turns your risk profile and goals into a simple,
S&P 500-based starter portfolio — inspired by how eToro and Trading 212 make
investing approachable.

> ⚠️ **Educational only — not financial advice.** This app produces illustrative,
> general-information portfolios for learning purposes. It is **not** a personal
> recommendation and is **not** provided by an FCA-authorised firm. Always do your
> own research and consider speaking to a regulated financial adviser before
> investing. Investing carries risk; you may get back less than you put in.

## What it does

1. You answer a few short questions (time horizon, risk comfort, goal).
2. The app maps your answers to a simple allocation built around an S&P 500 index
   core, plus a few illustrative large-cap holdings.
3. You get a clear, explained breakdown you can take away and research yourself.

## Tech stack

- **Next.js (App Router)** + TypeScript
- **Tailwind CSS**
- Market data via a pluggable provider adapter (free-tier API; key added later)
- Hero visual generated with [Higgsfield](https://higgsfield.ai)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env.local` and add your market-data API key.

## Status

Early development. Data layer currently runs on seeded S&P 500 reference data and
swaps to a live API through a single adapter.
