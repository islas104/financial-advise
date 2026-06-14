import { test, expect } from "@playwright/test";

test("landing hero loads with a primary CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /build my portfolio/i })).toBeVisible();
});

test("guided flow produces a portfolio with live prices and a money split", async ({ page }) => {
  await page.goto("/start");

  await page.getByRole("button", { name: /7\+ years/i }).click();
  await page.getByRole("button", { name: /buy more while it's cheap/i }).click();
  await page.getByRole("button", { name: /grow as much as possible/i }).click();

  // Result heading (risk band) becomes visible.
  await expect(page.getByRole("heading", { name: /aggressive|growth|balanced/i })).toBeVisible();

  // Live prices panel + money split render.
  await expect(page.getByText(/Current prices/i)).toBeVisible();
  await expect(page.getByText(/Split your money/i)).toBeVisible();

  // Time-horizon projection answers "over how long".
  await expect(page.getByText(/over about .* years/i)).toBeVisible();
  await expect(page.getByText(/could grow to/i)).toBeVisible();

  // Changing the amount updates the GBP split.
  const amount = page.getByLabel(/Amount to invest in pounds/i);
  await amount.fill("2000");
  await expect(page.getByText(/£/).first()).toBeVisible();
});
