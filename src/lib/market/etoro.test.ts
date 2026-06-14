import { describe, it, expect, vi, afterEach } from "vitest";
import { EtoroMarketProvider } from "./etoro";

const CREDS = { apiKey: "test-api", userKey: "test-user" };

const RATES = {
  rates: [
    { instrumentID: 1001, ask: 200, bid: 198, date: "2026-06-12T19:00:00Z" }, // AAPL
    { instrumentID: 4238, ask: 683, bid: 681, date: "2026-06-12T20:00:00Z" }, // VOO
  ],
};

function okResponse(body: unknown) {
  return { ok: true, status: 200, statusText: "OK", json: async () => body };
}

describe("EtoroMarketProvider", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns the mid of bid/ask for a mapped ticker", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse(RATES)));
    const provider = new EtoroMarketProvider(CREDS);
    const quote = await provider.getQuote("AAPL");
    expect(quote?.price).toBe(199); // (200 + 198) / 2
  });

  it("batches and memoises — one network call for many lookups", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse(RATES));
    vi.stubGlobal("fetch", fetchMock);
    const provider = new EtoroMarketProvider(CREDS);
    await provider.getQuote("AAPL");
    await provider.getQuote("VOO");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns null for an unmapped ticker", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse(RATES)));
    const provider = new EtoroMarketProvider(CREDS);
    expect(await provider.getQuote("UNKNOWN")).toBeNull();
  });

  it("throws on a non-ok HTTP response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401, statusText: "Unauthorized" }),
    );
    const provider = new EtoroMarketProvider(CREDS);
    await expect(provider.getQuote("AAPL")).rejects.toThrow(/401/);
  });

  it("throws when the response shape is invalid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(okResponse({ rates: [{ instrumentID: 1, ask: "x", bid: 1, date: "d" }] })),
    );
    const provider = new EtoroMarketProvider(CREDS);
    await expect(provider.getQuote("AAPL")).rejects.toThrow(/unexpected shape/);
  });

  it("returns null and warns when rates are empty", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse({ rates: [] })));
    const provider = new EtoroMarketProvider(CREDS);
    expect(await provider.getQuote("AAPL")).toBeNull();
    expect(warn).toHaveBeenCalled();
  });

  it("retries the batch fetch after a failure (cache is reset)", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(okResponse(RATES));
    vi.stubGlobal("fetch", fetchMock);
    const provider = new EtoroMarketProvider(CREDS);
    await expect(provider.getQuote("AAPL")).rejects.toThrow();
    const quote = await provider.getQuote("AAPL");
    expect(quote?.price).toBe(199);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("reports the latest rate timestamp via asOf", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse(RATES)));
    const provider = new EtoroMarketProvider(CREDS);
    expect(await provider.asOf()).toBe("2026-06-12T20:00:00Z");
  });
});
