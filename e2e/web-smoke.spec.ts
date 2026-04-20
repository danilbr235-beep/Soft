import { expect, test } from "@playwright/test";

test("recovers from legacy local storage state instead of showing a blank screen", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("pmhc:onboarding-complete", "true");
    localStorage.setItem("pmhc:quick-logs", "not-json");
    localStorage.setItem("pmhc:program-progress", "{\"programId\":false}");
  });

  await page.goto("/");
  await page.waitForTimeout(1000);

  await expect(page.getByText("A calm daily coach")).toBeVisible();
  await expect(page.getByText("Start privately")).toBeVisible();
});

test("shows a recovery screen instead of a blank page when startup rendering fails", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("pmhc:debug-force-error", "1");
    localStorage.setItem("pmhc:quick-logs", "not-json");
  });
  await page.reload();

  await expect(page.getByText("Soft hit a startup snag")).toBeVisible();
  await page.getByLabel("Clear local app state and restart").click();
  await expect(page.getByText("A calm daily coach")).toBeVisible();
  await expect(page.evaluate(() => localStorage.getItem("pmhc:debug-force-error"))).resolves.toBeNull();
});

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
  await page.getByText("Ask Coach why").click();
  await expect(page.getByText("How certain is this?")).toBeVisible();
  await page.getByLabel("Open Today").click();

  await page.getByLabel("Quick log Confidence").click();
  await expect(page.getByText("Log it quickly")).toBeVisible();
  await page.getByLabel("Save Confidence 7").click();

  await page.getByLabel("Quick log Symptoms").click();
  await expect(page.getByText("Log it quickly")).toBeVisible();
  await page.getByLabel("Save Symptoms Pain").click();
  await expect(page.getByText("Symptom review recommended")).toBeVisible();
  await expect(page.getByText("Keep today conservative")).toBeVisible();

  await page.getByLabel("Open Track").click();
  await expect(page.getByText("Baseline snapshot")).toBeVisible();
  await expect(page.getByText("2 today - 2 last 7 days")).toBeVisible();
  await expect(page.getByText("Average 7/10 - latest 7/10")).toBeVisible();
  await expect(page.getByText("Confidence: 7/10")).toBeVisible();
  await expect(page.getByText("Safety note")).toBeVisible();
  await page.getByLabel("Filter Track logs: Scores").click();
  await page.getByLabel("Edit Confidence log").click();
  await expect(page.getByText("Confidence: 10/10")).toBeVisible();
  await page.getByLabel("Prepare JSON export").click();
  await expect(page.getByText("Export ready: 1 log")).toBeVisible();
  await page.getByLabel("Filter Track logs: Symptoms").click();
  await page.getByLabel("Delete Symptoms log").click();
  await expect(page.getByText("No logs for this filter yet.")).toBeVisible();
  await expect(page.getByText("Safety note")).toBeHidden();
  await expect(page.getByText("2 pending local writes")).toBeVisible();

  await page.getByLabel("Sync demo writes").click();
  await expect(page.getByText("All local writes are synced.")).toBeVisible();

  await page.getByLabel("Open Learn").click();
  await page.getByLabel("Save Build a baseline without overchecking").click();
  await expect(page.getByLabel("Unsave Build a baseline without overchecking")).toBeVisible();
  await page.getByLabel("Mark complete Build a baseline without overchecking").click();
  await expect(page.getByLabel("Completed Build a baseline without overchecking")).toBeVisible();

  await page.getByLabel("Open Programs").click();
  await expect(page.getByText("Day 1 of 14")).toBeVisible();
  await expect(page.getByText("Today's plan")).toBeVisible();
  await expect(page.getByText("Baseline check")).toBeVisible();
  await page.getByLabel("Mark Baseline check done").click();
  await expect(page.getByText("1 of 3 done")).toBeVisible();
  await page.getByLabel("Complete program day").click();
  await expect(page.getByText("Day 2 of 14")).toBeVisible();

  await page.getByLabel("Open Coach").click();
  await expect(page.getByText("How certain is this?")).toBeVisible();
  await expect(page.getByText(/educational tracking support/i)).toBeVisible();

  await page.getByLabel("Open Settings").click();
  await expect(page.getByText(/Vault lock is enabled/i)).toBeVisible();
  await page.getByLabel("Lock demo vault").click();
  await expect(page.getByText("Soft is locked")).toBeVisible();
  await page.getByLabel("Unlock demo vault").click();
  await expect(page.getByText("Privacy vault")).toBeVisible();
});

test("can choose English or Russian from onboarding and settings", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Language")).toBeVisible();
  await page.getByLabel("Use Russian").click();
  await expect(page.getByText("Спокойный ежедневный коуч")).toBeVisible();
  await page.getByLabel("Использовать английский").click();
  await expect(page.getByText("A calm daily coach")).toBeVisible();

  await page.getByText("Start privately").click();
  await page.getByLabel("Confidence").click();
  await page.getByLabel("Next").click();
  await page.getByLabel("Mixed signals").click();
  await page.getByLabel("Next").click();
  await page.getByLabel("Simple mode").click();
  await page.getByLabel("Generate Today").click();

  await page.getByLabel("Open Settings").click();
  await page.getByLabel("Use Russian").click();
  await expect(page.getByText("Настройки").first()).toBeVisible();
  await expect(page.getByText("Сегодня").first()).toBeVisible();
});

test("pro mode can record pump use and receives conservative guidance", async ({ page }) => {
  await page.goto("/");

  await page.getByText("Start privately").click();
  await page.getByLabel("Confidence").click();
  await page.getByLabel("Next").click();
  await page.getByLabel("Mixed signals").click();
  await page.getByLabel("Next").click();
  await page.getByLabel("Pro mode").click();
  await page.getByLabel("Generate Today").click();

  await page.getByLabel("Quick log Morning").click();
  await page.getByLabel("Save Morning Yes").click();
  await page.getByLabel("Quick log Libido").click();
  await page.getByLabel("Save Libido 7").click();
  await page.getByLabel("Quick log Confidence").click();
  await page.getByLabel("Save Confidence 7").click();

  await page.getByLabel("Quick log Pump").click();
  await page.getByLabel("Save Pump Yes").click();

  await expect(page.getByText("Keep pump work light today")).toBeVisible();
  await expect(page.getByText("Keep intensity conservative")).toBeVisible();
});
