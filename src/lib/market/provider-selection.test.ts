import { describe, it, expect, vi, beforeEach } from "vitest";

// getMarketDataProvider caches a module-level singleton, so each case re-imports
// the module fresh via resetModules to exercise selection deterministically.
describe("getMarketDataProvider selection", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("defaults to the seed provider when MARKET_DATA_PROVIDER is unset", async () => {
    const mod = await import("./provider");
    expect(mod.isLiveProvider()).toBe(false);
    const constituents = await mod.getMarketDataProvider().listConstituents();
    expect(constituents.length).toBeGreaterThan(0);
  });

  it("uses the eToro provider when configured with both credentials", async () => {
    vi.stubEnv("MARKET_DATA_PROVIDER", "etoro");
    vi.stubEnv("ETORO_API_KEY", "k");
    vi.stubEnv("ETORO_USER_KEY", "u");
    const mod = await import("./provider");
    expect(mod.isLiveProvider()).toBe(true);
  });

  it("warns and falls back to seed when etoro is set but credentials are missing", async () => {
    vi.stubEnv("MARKET_DATA_PROVIDER", "etoro");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mod = await import("./provider");
    expect(mod.isLiveProvider()).toBe(false);
    expect(warn).toHaveBeenCalled();
  });
});
