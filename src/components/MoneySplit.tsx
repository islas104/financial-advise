"use client";

import { useState } from "react";
import type { AllocationSlice, Projection } from "@/lib/portfolio/types";

const DEFAULT_AMOUNT = 1000;

function gbp(value: number): string {
  return value.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  });
}

type Props = {
  slices: readonly AllocationSlice[];
  projection: Projection;
};

export function MoneySplit({ slices, projection }: Props) {
  const [amount, setAmount] = useState<number>(DEFAULT_AMOUNT);
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;

  const { years, assumedAnnualReturnPct } = projection;
  const projectedValue = Math.round(
    safeAmount * Math.pow(1 + assumedAnnualReturnPct / 100, years),
  );

  return (
    <div className="surface p-7 md:col-span-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="eyebrow">Split your money</p>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">If I invest</span>
          <span className="flex items-center rounded-lg border border-line bg-paper/50 pl-3 focus-within:border-emerald">
            <span aria-hidden className="text-muted">
              £
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              value={Number.isNaN(amount) ? "" : amount}
              onChange={(event) => setAmount(event.target.valueAsNumber)}
              aria-label="Amount to invest in pounds"
              className="w-28 bg-transparent px-2 py-2 font-mono tabular-nums outline-none"
            />
          </span>
        </label>
      </div>

      <p className="mt-5 rounded-xl bg-emerald-tint/40 px-5 py-4 text-sm leading-relaxed text-ink-soft">
        Over about <strong className="text-ink">{years} years</strong>, {gbp(safeAmount)} could grow
        to roughly <strong className="text-emerald-strong">{gbp(projectedValue)}</strong> — an
        illustrative example at {assumedAnnualReturnPct}% a year. This is <strong>not a forecast</strong>;
        returns aren&apos;t guaranteed and you could get back less than you put in.
      </p>

      <ul className="mt-5 space-y-1">
        {slices.map((slice) => {
          const value = Math.round((safeAmount * slice.percent) / 100);
          return (
            <li
              key={slice.label}
              className="flex items-baseline justify-between gap-4 border-b border-line/60 py-2"
            >
              <span className="text-sm">
                <span className="font-medium text-ink">{slice.label}</span>
                {slice.ticker ? (
                  <span className="ml-2 font-mono text-xs text-muted">{slice.ticker}</span>
                ) : null}
              </span>
              <span className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-muted">{slice.percent}%</span>
                <span className="w-20 text-right font-mono font-medium tabular-nums text-ink">
                  {gbp(value)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs text-muted">
        Illustrative split of {gbp(safeAmount)} by allocation. Live prices shown above are in USD.
      </p>
    </div>
  );
}
