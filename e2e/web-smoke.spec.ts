import { expect, test } from "@playwright/test";

test("mobile web MVP opens, completes onboarding, and records a quick log", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("A calm daily coach")).toBeVisible();
  await page.getByText("Start privately").click();
  await expect(page.getByText("Choose the main focus.")).toBeVisible();
  await page.getByLabel("Confidence").click();
  await page.getByLabel("Next").click();

  await expect(page.getByText("Set a simple baseline.")).toBeVisible();
  await page.getByLabel("Mixed signals").click();
  await page.getByLabel("Next").click();

  await expect(page.getByText("Choose operating style.")).toBeVisible();
  await page.getByLabel("Simple mode").click();
  await page.getByLabel("Generate Today").click();

  await expect(page.getByText("Current priority", { exact: true })).toBeVisible();
  await expect(page.getByText("Build your baseline")).toBeVisible();

  await page.getByLabel("Quick log Confidence").click();
  await expect(page.getByText("Log it quickly")).toBeVisible();
  await page.getByLabel("Save Confidence 7").click();

  await page.getByLabel("Open Track").click();
  await expect(page.getByText("confidence: 7")).toBeVisible();
  await expect(page.getByText("1 pending local write")).toBeVisible();

  await page.getByLabel("Sync demo writes").click();
  await expect(page.getByText("All local writes are synced.")).toBeVisible();

  await page.getByLabel("Open Coach").click();
  await expect(page.getByText("How certain is this?")).toBeVisible();
  await expect(page.getByText(/not a diagnosis/i)).toBeVisible();
});
