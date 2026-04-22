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
  await expect(page.getByText("Mode")).toBeVisible();
  await expect(page.getByText("Up to date")).toBeVisible();
  await expect(page.getByText("Vault on")).toBeVisible();
  await expect(page.getByText("Build your baseline")).toBeVisible();
  await expect(page.getByText("Start with two calm scores before anything more ambitious.")).toBeVisible();
  await expect(page.getByText("Two-score reset")).toBeVisible();
  await page.getByText("Ask Coach why").click();
  await expect(page.getByText("How certain is this?")).toBeVisible();
  await page.getByLabel("Open Today").click();

  await page.getByLabel("Quick log Confidence").click();
  await expect(page.getByText("Log it quickly")).toBeVisible();
  await page.getByLabel("Save Confidence 7").click();
  await expect(page.getByText("Pending sync")).toBeVisible();

  await page.getByLabel("Quick log Symptoms").click();
  await expect(page.getByText("Log it quickly")).toBeVisible();
  await page.getByLabel("Save Symptoms Pain").click();
  await expect(page.getByText("Symptom review recommended")).toBeVisible();
  await expect(page.getByText("Keep today conservative")).toBeVisible();
  await expect(page.getByText("Log symptoms and keep the rest of today to one recovery-first action.")).toBeVisible();
  await expect(page.getByText("Recovery reset")).toBeVisible();

  await page.getByLabel("Open Track").click();
  await expect(page.getByText("Baseline snapshot")).toBeVisible();
  await expect(page.getByText("2 today - 2 last 7 days")).toBeVisible();
  await expect(page.getByText("Average 7/10 - latest 7/10")).toBeVisible();
  await expect(page.getByText("Weekly snapshot")).toBeVisible();
  await expect(page.getByText("7/10 avg")).toBeVisible();
  await expect(page.getByText("1 check-in")).toBeVisible();
  await expect(page.getByText("Caution signal", { exact: true })).toBeVisible();
  await page.getByLabel("Open Review").click();
  await expect(page.getByText("Review digest", { exact: true })).toBeVisible();
  await expect(page.getByText("Recovery-first read")).toBeVisible();
  await expect(page.getByText("Digest confidence")).toBeVisible();
  await expect(page.getByText("High confidence")).toBeVisible();
  await expect(page.getByText("Recent reads lean cautious enough that the next block should stay recovery-first.")).toBeVisible();
  await page.getByLabel("Open Review section: 7 days").click();
  await expect(page.getByText("Weekly review")).toBeVisible();
  await expect(page.getByText("Recovery-first week", { exact: true })).toBeVisible();
  await expect(page.getByText("A symptom check-in still makes this week conservative.")).toBeVisible();
  await expect(page.getByText("Next gentle step")).toBeVisible();
  await expect(page.getByText("2 logs this week - 1 score - 1 symptom check-in")).toBeVisible();
  await page.getByLabel("Open Review section: 30 days").click();
  await expect(page.getByText("30-day review")).toBeVisible();
  await expect(page.getByText("Recovery-first month", { exact: true })).toBeVisible();
  await expect(page.getByText("A symptom check-in inside the last 30 days keeps this month conservative.")).toBeVisible();
  await expect(page.getByText("Next conservative step")).toBeVisible();
  await expect(page.getByText("2 logs in 30 days - 1 score - 1 symptom check-in - 0 completed cycles")).toBeVisible();
  await page.getByLabel("Open recap format: Packet").click();
  await page.getByLabel("Prepare recap").click();
  await expect(page.getByText("Preview: Packet")).toBeVisible();
  await expect(page.getByText("30 days packet")).toBeVisible();
  await expect(page.getByText("Signals", { exact: true })).toBeVisible();
  await expect(page.getByText("History snapshot", { exact: true })).toBeVisible();
  await page.getByLabel("Open Track").click();
  await expect(page.getByText("Pattern hints")).toBeVisible();
  await expect(page.getByText("More paired logs needed")).toBeVisible();
  await expect(page.getByText("Need more paired logs before this section can say anything useful.")).toBeVisible();
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
  await page.getByLabel("Open Today").click();
  await expect(page.getByText("Up to date")).toBeVisible();

  await page.getByLabel("Open Learn").click();
  await expect(page.getByText("Recommended for today")).toBeVisible();
  await page.getByLabel("Open Build a baseline without overchecking").first().click();
  await expect(page.getByText("Because it fits your current review digest")).toBeVisible();
  await page.getByLabel("Save Build a baseline without overchecking").click();
  await expect(page.getByLabel("Unsave Build a baseline without overchecking")).toBeVisible();
  await page.getByLabel("Mark complete Build a baseline without overchecking").click();
  await expect(page.getByLabel("Completed Build a baseline without overchecking")).toBeVisible();
  await page.getByLabel("Back to library").click();
  await page.getByLabel("Filter Learn content: Recovery").click();
  await expect(page.getByText("Sleep setup for next-day readiness").first()).toBeVisible();

  await page.getByLabel("Open Programs").click();
  await expect(page.getByText("Day 1 of 14")).toBeVisible();
  await expect(page.getByText("Adjustment for today")).toBeVisible();
  await expect(page.getByText("Start with the check-in task and wait for the next signal before adding more.")).toBeVisible();
  await expect(page.getByText("Guided by review digest: Baseline-building read")).toBeVisible();
  await page.getByLabel("Pause program").click();
  await expect(page.getByText("Program paused for now")).toBeVisible();
  await page.getByLabel("Resume program").click();
  await expect(page.getByText("Program paused for now")).toBeHidden();
  await expect(page.getByText("Today's plan")).toBeVisible();
  await expect(page.getByText("Open plan details")).toBeVisible();
  await page.getByLabel("Open plan details").click();
  await expect(page.getByText("Plan details")).toBeVisible();
  await expect(page.getByText("Next conservative step")).toBeVisible();
  await expect(page.getByText("Observe first")).toBeVisible();
  await expect(page.getByText("Progress summary")).toBeVisible();
  await expect(page.getByText("Baseline check")).toBeVisible();
  await page.getByLabel("Mark Baseline check done").click();
  await expect(page.getByText("1 of 3 done")).toBeVisible();
  await page.getByLabel("Complete program day").click();
  await expect(page.getByText("Day 2 of 14")).toBeVisible();
  await expect(page.getByText("1 completed")).toBeVisible();
  await expect(page.getByText("Practice day")).toBeVisible();
  await expect(page.getByText("Practice lightly")).toBeVisible();
  await expect(page.getByText("Confidence map")).toBeVisible();
  await page.getByLabel("Skip program day").click();
  await expect(page.getByText("Day 3 of 14")).toBeVisible();
  await expect(page.getByText("1 skipped")).toBeVisible();
  await page.getByLabel("Take a program rest day").click();
  await expect(page.getByText("Day 4 of 14")).toBeVisible();
  await expect(page.getByText("1 rest")).toBeVisible();
  await expect(page.getByText("1 skipped")).toBeVisible();
  await expect(page.getByText("11 left")).toBeVisible();

  await page.getByLabel("Open Coach").click();
  await expect(page.getByText("How certain is this?")).toBeVisible();
  await page.getByLabel("Open coach question: What does this alert mean?").click();
  await expect(page.getByText("No active alerts right now")).toBeVisible();
  await page.getByLabel("Open coach question: What should I do next?").click();
  await expect(page.getByText("Start with two calm scores before deciding whether today needs anything more.")).toBeVisible();
  await expect(page.getByText(/educational tracking support/i)).toBeVisible();

  await page.getByLabel("Open Settings").click();
  await expect(page.getByText(/Vault lock is enabled/i)).toBeVisible();
  await expect(page.getByText("Auto-lock after 5 minutes of inactivity.")).toBeVisible();
  await page.getByLabel("Enter 4-8 digits").fill("1234");
  await page.getByLabel("Save PIN").click();
  await expect(page.getByText("PIN is set for this local demo.")).toBeVisible();
  await page.getByLabel("Lock demo vault").click();
  await expect(page.getByText("Soft is locked")).toBeVisible();
  await page.getByRole("textbox", { name: "PIN" }).fill("0000");
  await page.getByLabel("Unlock with PIN").click();
  await expect(page.getByText("That PIN did not match. Try again calmly.")).toBeVisible();
  await page.getByRole("textbox", { name: "PIN" }).fill("1234");
  await page.getByLabel("Unlock with PIN").click();
  await expect(page.getByText("Privacy vault")).toBeVisible();
});

test("completed program shows a conservative wrap-up", async ({ page }) => {
  await page.goto("/");

  await page.getByText("Start privately").click();
  await page.getByLabel("Confidence").click();
  await page.getByLabel("Next").click();
  await page.getByLabel("Mixed signals").click();
  await page.getByLabel("Next").click();
  await page.getByLabel("Simple mode").click();
  await page.getByLabel("Generate Today").click();

  await page.evaluate(() => {
    localStorage.setItem(
      "pmhc:program-progress",
      JSON.stringify({
        programId: "confidence-reset-14",
        completedDayIndexes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        completedTaskIdsByDay: {},
        restDayIndexes: [10, 11],
        skippedDayIndexes: [12, 13, 14],
        lastCompletedAt: "2026-04-19T14:00:00.000Z",
        pausedAt: null,
        updatedAt: "2026-04-19T14:00:00.000Z",
      }),
    );
  });
  await page.reload();
  if ((await page.getByLabel("Unlock demo vault").count()) > 0) {
    await page.getByLabel("Unlock demo vault").click();
  }

  await page.getByLabel("Open Programs").click();
  await expect(page.getByText("Program wrap-up")).toBeVisible();
  await expect(page.getByText("A mixed but useful finish")).toBeVisible();
  await expect(page.getByText("Completed 9, rest 2, skipped 3.")).toBeVisible();
  await expect(
    page.getByText("Take the useful signal from this cycle and spend a few days rebuilding baseline before choosing intensity."),
  ).toBeVisible();
  await expect(page.getByText("Recommended next paths")).toBeVisible();
  await expect(page.getByText("7-day clarity baseline")).toBeVisible();
  await expect(page.getByText("Sleep and environment reset")).toBeVisible();
  await expect(page.getByText("A short baseline loop can rebuild signal without pressure.")).toBeVisible();
  await expect(page.getByText("Best match for the current review digest: Baseline-building read.")).toHaveCount(1);
  await expect(page.getByText("100% complete")).toBeVisible();
  await expect(page.getByLabel("Complete program day")).toHaveCount(0);

  await page.getByLabel("Start 7-day clarity baseline").click();
  await expect(page.getByText("Day 1 of 7")).toBeVisible();
  await expect(page.getByText("7-day clarity baseline", { exact: true })).toBeVisible();
  await expect(page.getByText("Program wrap-up")).toHaveCount(0);
  await expect(page.getByLabel("Complete program day")).toBeVisible();
  await expect(page.getByText("Recent cycles", { exact: true })).toBeVisible();
  await expect(page.getByText("Continued with: 7-day clarity baseline")).toBeVisible();
  await expect(page.getByText("A mixed but useful finish").first()).toBeVisible();
  await page.getByLabel("Open Review").click();
  await expect(page.getByText("Review digest", { exact: true })).toBeVisible();
  await expect(page.getByText("Baseline-building read")).toBeVisible();
  await expect(page.getByText("Medium confidence")).toBeVisible();
  await expect(page.getByText("Recent cycle context: 14-day confidence reset")).toBeVisible();
  await page.getByLabel("Open Review section: 7 days").click();
  await expect(page.getByText("Weekly review")).toBeVisible();
  await expect(page.getByText("Baseline-building week", { exact: true })).toBeVisible();
  await expect(page.getByText("Latest cycle context: 14-day confidence reset")).toBeVisible();
  await page.getByLabel("Open Review section: 30 days").click();
  await expect(page.getByText("30-day review")).toBeVisible();
  await expect(page.getByText("Baseline-building month", { exact: true })).toBeVisible();
  await expect(page.getByText("Latest 30-day cycle context: 14-day confidence reset")).toBeVisible();
  await page.getByLabel("Open Review section: Cycles").click();
  await expect(page.getByText("Program review")).toBeVisible();
  await expect(page.getByText("A compact read of recent finished cycles, separate from daily logs.")).toBeVisible();
  await expect(page.getByText("Recent direction")).toBeVisible();
  await expect(
    page.getByText("The recent sequence is holding a mixed pattern rather than clearly improving or worsening."),
  ).toBeVisible();
  await expect(page.getByText("Latest completed cycle: 14-day confidence reset")).toBeVisible();
  await page.getByLabel("Open recap format: Packet").click();
  await page.getByLabel("Prepare recap").click();
  await expect(page.getByText("Preview: Packet")).toBeVisible();
  await expect(page.getByText("Cycles packet")).toBeVisible();
  await expect(page.getByText("History snapshot", { exact: true })).toBeVisible();
  await expect(page.getByText("Latest completed cycle: 14-day confidence reset")).toHaveCount(2);
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
