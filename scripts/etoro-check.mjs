// Standalone eToro credential checker. Run with: npm run etoro:check
// Reads ETORO_API_KEY and ETORO_USER_KEY from .env.local (never committed) and
// makes one authenticated call to the live rates endpoint to confirm they work.

import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const ENV_FILE = ".env.local";
const RATES_URL =
  "https://public-api.etoro.com/api/v1/market-data/instruments/rates?instrumentIds=1001,1";

function loadEnvLocal() {
  try {
    const raw = readFileSync(ENV_FILE, "utf8");
    const env = {};
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
    return env;
  } catch {
    return {};
  }
}

function warnIfKeysLookSwapped(apiKey, userKey) {
  // The x-api-key is an opaque string; the x-user-key is a base64 token (eyJ...).
  if (apiKey.startsWith("eyJ")) {
    console.warn(
      "⚠️  ETORO_API_KEY looks like a user-key (starts with 'eyJ'). The api-key is the\n" +
        "   opaque string, not the base64 token — you may have the two swapped.",
    );
  }
  if (userKey && !userKey.startsWith("eyJ")) {
    console.warn(
      "⚠️  ETORO_USER_KEY does not look like a base64 token (expected to start with 'eyJ').",
    );
  }
}

async function main() {
  const env = loadEnvLocal();
  const apiKey = env.ETORO_API_KEY ?? process.env.ETORO_API_KEY ?? "";
  const userKey = env.ETORO_USER_KEY ?? process.env.ETORO_USER_KEY ?? "";

  if (!apiKey || !userKey) {
    console.error("✗ Missing credentials. Add both to .env.local:\n");
    console.error("    ETORO_API_KEY=<opaque api key>");
    console.error("    ETORO_USER_KEY=<eyJ... user key>\n");
    console.error("Both are issued in the eToro developer portal: https://api-portal.etoro.com/");
    process.exit(1);
  }

  warnIfKeysLookSwapped(apiKey, userKey);

  const res = await fetch(RATES_URL, {
    headers: {
      "x-api-key": apiKey,
      "x-user-key": userKey,
      "x-request-id": randomUUID(),
      accept: "application/json",
    },
  });

  const body = await res.text();

  if (res.status === 401) {
    console.error("✗ 401 Unauthorized — credentials rejected.");
    console.error("  Check that the app is approved in the portal and both keys are current.");
    process.exit(1);
  }
  if (!res.ok) {
    console.error(`✗ HTTP ${res.status}: ${body.slice(0, 300)}`);
    process.exit(1);
  }

  console.log(`✓ Authenticated. HTTP ${res.status}.`);
  console.log("Sample rates response:");
  console.log(body.slice(0, 600));
}

main().catch((err) => {
  console.error("✗ Request failed:", err.message);
  process.exit(1);
});
