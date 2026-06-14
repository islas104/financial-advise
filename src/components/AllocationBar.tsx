import type { AllocationSlice, SliceKind } from "@/lib/portfolio/types";

const KIND_COLOR: Record<SliceKind, string> = {
  index: "var(--emerald)",
  equity: "var(--gold)",
  bonds: "var(--ink-soft)",
  cash: "var(--muted)",
};

type Props = {
  slices: readonly AllocationSlice[];
};

export function AllocationBar({ slices }: Props) {
  return (
    <div>
      <div
        className="flex h-4 w-full overflow-hidden rounded-full"
        role="img"
        aria-label="Portfolio allocation by holding"
      >
        {slices.map((slice) => (
          <div
            key={slice.label}
            style={{ width: `${slice.percent}%`, background: KIND_COLOR[slice.kind] }}
            title={`${slice.label}: ${slice.percent}%`}
          />
        ))}
      </div>

      <ul className="mt-5 space-y-2.5">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center gap-3 text-sm">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: KIND_COLOR[slice.kind] }}
            />
            <span className="font-medium text-ink">{slice.label}</span>
            {slice.ticker ? (
              <span className="font-mono text-xs text-muted">{slice.ticker}</span>
            ) : null}
            <span className="ml-auto font-mono tabular-nums text-ink-soft">{slice.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
