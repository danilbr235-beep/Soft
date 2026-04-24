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
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          localStorage.setItem("pmhc:test-clipboard", text);
        },
      },
    });
  });

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
  await expect(page.getByText("Morning routine", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Wake and light anchor")).toBeVisible();
  await expect(page.getByText("Morning nudge")).toBeVisible();
  await expect(page.getByText("Weekdays - 08:00")).toBeVisible();
  await expect(page.getByText("Keep morning simple. Light first.")).toBeVisible();
  await expect(page.getByText("Today nudge check")).toBeVisible();
  await expect(page.getByText("Keep one calm cue", { exact: true })).toBeVisible();
  await expect(page.getByText("0 of 3", { exact: true })).toBeVisible();
  await expect(page.getByText("Land the wake-and-light anchor first. Add the other two steps only after that starts to stick.")).toBeVisible();
  await page.getByLabel("Mark done: Wake and light anchor").click();
  await expect(page.getByText("1 of 3", { exact: true })).toBeVisible();
  await expect(page.getByText("Pair the quick morning log right after the anchor instead of adding a new step.").first()).toBeVisible();
  await expect(page.getByText("Use one rail")).toBeVisible();
  await expect(page.getByText("Morning rail first")).toBeVisible();
  await expect(page.getByText("Practice can wait")).toBeVisible();
  await expect(page.getByText("Optional morning experiments", { exact: true })).toBeVisible();
  await expect(page.getByText("Cold finish: caution first")).toBeVisible();
  await expect(page.getByText("Should I simplify today?")).toBeVisible();
  await page.getByLabel("Open note Cold finish: caution first").click();
  await expect(page.getByText("Cold finish: caution first")).toBeVisible();
  await page.getByLabel("Back to library").click();
  await page.getByLabel("Open Today").click();
  await page.getByLabel("Open guide: Morning reset guide").click();
  await expect(page.getByText("Morning reset: light, signal, move")).toBeVisible();
  await page.getByLabel("Back to library").click();
  await page.getByLabel("Open Today").click();
  await expect(page.getByText("2 of 3", { exact: true })).toBeVisible();
  await page.getByLabel("Quick log: One calm check-in").click();
  await expect(page.getByLabel("Save Morning Yes")).toBeVisible();
  await page.getByLabel("Save Morning Yes").click();
  await expect(page.getByText("3 of 3", { exact: true })).toBeVisible();
  await expect(page.getByText("Repeat the same three-step morning tomorrow before changing the routine.")).toBeVisible();
  await expect(page.getByText("Stop after one small action")).toBeVisible();
  await expect(page.getByText("One-line note")).toBeVisible();
  await expect(page.getByText("Build your baseline")).toBeVisible();
  await expect(page.getByText("Start with two calm scores before anything more ambitious.")).toBeVisible();
  await expect(page.getByText("Daily session")).toBeVisible();
  await expect(page.getByText("0 of 4 done")).toBeVisible();
  await page.getByLabel("Open daily session step: Lesson").click();
  await expect(page.getByText("Morning reset: light, signal, move")).toBeVisible();
  await page.getByLabel("Mark complete Morning reset: light, signal, move").click();
  await page.getByLabel("Back to library").click();
  await page.getByLabel("Open Today").click();
  await expect(page.getByText("1 of 4 done")).toBeVisible();
  await page.getByLabel("Open daily session step: Quiz").click();
  await expect(page.getByText("Log it quickly")).toBeVisible();
  await page.getByLabel("Save Confidence 7").click();
  await expect(page.getByText("2 of 4 done")).toBeVisible();
  await expect(page.getByText("Two-score reset")).toBeVisible();
  await page.getByText("Ask Coach why").first().click();
  await expect(page.getByText("How certain is this?")).toBeVisible();
  await page.getByLabel("Open Today").click();

  await expect(page.getByText("Pending sync")).toBeVisible();

  await page.getByLabel("Quick log Symptoms").click();
  await expect(page.getByText("Log it quickly")).toBeVisible();
  await page.getByLabel("Save Symptoms Pain").click();
  await expect(page.getByText("Symptom review recommended")).toBeVisible();
  await expect(page.getByText("Keep today conservative")).toBeVisible();
  await expect(page.getByText("Log symptoms and keep the rest of today to one recovery-first action.")).toBeVisible();
  await expect(page.getByText("One recovery-first step")).toBeVisible();

  await page.getByLabel("Open Track").click();
  await expect(page.getByText("Baseline snapshot")).toBeVisible();
  await expect(page.getByText("3 today - 3 last 7 days")).toBeVisible();
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
  await expect(page.getByText("What changed this week")).toBeVisible();
  await expect(page.getByText("Pattern: this week tightened the recovery picture")).toBeVisible();
  await expect(page.getByText("Symptoms: 1 check-in this week vs 0 check-ins last week")).toBeVisible();
  await expect(page.getByText("Morning routine review")).toBeVisible();
  await expect(page.getByText("Morning nudge review")).toBeVisible();
  await expect(page.getByText("Full mornings: 1/7 - Partial mornings: 0 - Streak: 1 day")).toBeVisible();
  await page.getByLabel("Open Review section: 7 days").click();
  await expect(page.getByText("Weekly review")).toBeVisible();
  await expect(page.getByText("Recovery-first week", { exact: true })).toBeVisible();
  await expect(page.getByText("A symptom check-in still makes this week conservative.")).toBeVisible();
  await expect(page.getByText("Next gentle step")).toBeVisible();
  await expect(page.getByText("3 logs this week - 1 score - 1 symptom check-in")).toBeVisible();
  await expect(page.getByText("Morning routine review")).toBeVisible();
  await page.getByLabel("Open Review section: 30 days").click();
  await expect(page.getByText("30-day review")).toBeVisible();
  await expect(page.getByText("Recovery-first month", { exact: true })).toBeVisible();
  await expect(page.getByText("A symptom check-in inside the last 30 days keeps this month conservative.")).toBeVisible();
  await expect(page.getByText("Next conservative step")).toBeVisible();
  await expect(page.getByText("3 logs in 30 days - 1 score - 1 symptom check-in - 0 completed cycles")).toBeVisible();
  await page.getByLabel("Open recap format: Packet").click();
  await page.getByLabel("Prepare recap").click();
  await expect(page.getByText("Preview: Packet").first()).toBeVisible();
  await expect(page.getByText("30 days packet")).toHaveCount(2);
  await expect(page.getByText("Signals", { exact: true })).toHaveCount(2);
  await expect(page.getByText("Morning routine", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Pattern: first full morning landed").first()).toBeVisible();
  await expect(page.getByText("Morning nudge", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Pattern: repeat before retuning").first()).toBeVisible();
  await expect(page.getByText("History snapshot", { exact: true })).toHaveCount(2);
  await expect(page.getByText("Recent packets")).toBeVisible();
  await expect(page.getByText("Prepared packet recaps stay local on this device until you clear app data.")).toBeVisible();
  await page.getByLabel("Filter packet archive: 7 days").click();
  await expect(page.getByText("No saved packets for 7 days yet.")).toBeVisible();
  await page.getByLabel("Filter packet archive: 30 days").click();
  await page.getByLabel("Export packet 30 days packet").click();
  await expect(page.getByText("Packet copied.")).toBeVisible();
  await expect(page.evaluate(() => localStorage.getItem("pmhc:test-clipboard"))).resolves.toContain("30 days packet");
  await expect(page.evaluate(() => localStorage.getItem("pmhc:test-clipboard"))).resolves.toContain("Morning routine");
  await expect(page.evaluate(() => localStorage.getItem("pmhc:test-clipboard"))).resolves.toContain("Pattern: first full morning landed");
  await expect(page.evaluate(() => localStorage.getItem("pmhc:test-clipboard"))).resolves.toContain("Morning nudge");
  await expect(page.evaluate(() => localStorage.getItem("pmhc:test-clipboard"))).resolves.toContain("Pattern: repeat before retuning");
  await page.reload();
  if ((await page.getByLabel("Unlock demo vault").count()) > 0) {
    await page.getByLabel("Unlock demo vault").click();
  }
  await page.getByLabel("Open Review").click();
  await expect(page.getByText("Recent packets")).toBeVisible();
  await expect(page.getByText("30 days packet")).toHaveCount(1);
  await page.getByLabel("Preview: 30 days packet").click();
  await expect(page.getByText("Preview: Packet").first()).toBeVisible();
  await expect(page.getByText("30 days packet")).toHaveCount(2);
  await expect(page.getByText("Pattern: first full morning landed").first()).toBeVisible();
  await expect(page.getByText("Pattern: repeat before retuning").first()).toBeVisible();
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
  await expect(page.getByText("3 pending local writes")).toBeVisible();

  await page.getByLabel("Sync demo writes").click();
  await expect(page.getByText("All local writes are synced.")).toBeVisible();
  await page.getByLabel("Open Today").click();
  await expect(page.getByText("Up to date")).toBeVisible();

  await page.getByLabel("Open Learn").click();
  await expect(page.getByText("Morning routine review")).toBeVisible();
  await expect(page.getByLabel("Open Two-minute mobility reset").first()).toBeVisible();
  await expect(page.getByText("Recommended for today")).toBeVisible();
  await expect(page.getByText("Clinical backbone")).toBeVisible();
  await expect(page.getByText("American Urological Association")).toBeVisible();
  await page.getByLabel("Open Two-minute mobility reset").first().click();
  await page.getByLabel("Save Two-minute mobility reset").click();
  await page.getByLabel("Mark complete Two-minute mobility reset").click();
  await expect(page.getByLabel("Completed Two-minute mobility reset")).toBeVisible();
  await page.getByLabel("Back to library").click();
  await page.getByLabel("Filter Learn content: Recovery").click();
  await expect(page.getByText("Sleep setup for next-day readiness").first()).toBeVisible();

  await page.getByLabel("Open Programs").click();
  await expect(page.getByText("Day 1 of 14")).toBeVisible();
  await expect(page.getByText("Adjustment for today")).toBeVisible();
  await expect(page.getByText("Should I simplify today?")).toBeVisible();
  await expect(page.getByText("Keep the plan narrow")).toBeVisible();
  await expect(page.getByText("Recommended cap: one task after the opening check-in.")).toBeVisible();
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
  await page.getByLabel("Open coach question: What about the morning routine?").click();
  await expect(page.getByText("Repeat the same three-step morning tomorrow before changing the routine.")).toBeVisible();
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
  await expect(page.getByText("Morning nudges")).toBeVisible();
  await expect(page.getByText("Should I simplify today?")).toBeVisible();
  await page.getByLabel("Set morning nudge style: Supportive").click();
  await page.getByLabel("Set morning nudge timing: 09:00").click();
  await page.getByLabel("Set morning nudge cadence: Daily").click();
  await page.getByLabel("Open Today").click();
  await expect(page.getByText("Morning nudge")).toBeVisible();
  await expect(page.getByText("Daily - 09:00")).toBeVisible();
  await expect(page.getByText("Today already landed. Keep the same short morning again tomorrow.")).toBeVisible();
  await page.getByLabel("Open Settings").click();
  await expect(page.getByText("Review packets")).toBeVisible();
  await page.getByLabel("Set default review section: 7 days").click();
  await page.getByLabel("Set default recap format: Packet").click();
  await page.getByLabel("Remove morning routine from review packets").click();
  await page.getByLabel("Open Review").click();
  await expect(page.getByText("Weekly review")).toBeVisible();
  await page.getByLabel("Prepare recap").click();
  await expect(page.getByText("Preview: Packet").first()).toBeVisible();
  await expect(page.getByText("7 days packet").first()).toBeVisible();
  await expect(page.getByText("Morning nudge", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Pattern: recent changes are still settling").first()).toBeVisible();
  await expect(page.getByText("Timing: Daily - 09:00").first()).toBeVisible();
  await expect(page.getByText("Latest packet contrast")).toBeVisible();
  await expect(page.getByText(/^Changed blocks:/)).toBeVisible();
  await expect(page.getByText("Earlier").first()).toBeVisible();
  await expect(page.getByText("Latest").first()).toBeVisible();
  await page.getByLabel("Filter packet archive: 7 days").click();
  await expect(page.getByText("Morning routine", { exact: true })).toHaveCount(0);
});

test("settings can apply a calmer morning nudge setup from current guidance", async ({ page }) => {
  await page.goto("/");

  await page.getByText("Start privately").click();
  await page.getByLabel("Confidence").click();
  await page.getByLabel("Next").click();
  await page.getByLabel("Mixed signals").click();
  await page.getByLabel("Next").click();
  await page.getByLabel("Simple mode").click();
  await page.getByLabel("Generate Today").click();

  await page.getByLabel("Open Settings").click();
  await expect(page.getByText("Morning nudges")).toBeVisible();
  await page.getByLabel("Set morning nudge style: Supportive").click();
  await page.getByLabel("Set morning nudge timing: 09:00").click();
  await page.getByLabel("Set morning nudge cadence: Daily").click();
  await expect(page.getByText("Recommended setup")).toBeVisible();
  await expect(page.getByText("Keep one calm cue", { exact: true })).toBeVisible();
  await expect(page.getByText("Style: Supportive -> Discreet")).toBeVisible();
  await expect(page.getByText("Timing: 09:00 -> 08:00")).toBeVisible();
  await expect(page.getByText("Cadence: Daily -> Weekdays")).toBeVisible();
  await page.getByLabel("Apply calmer setup").click();
  await expect(page.getByText("Current settings already fit this morning read.")).toBeVisible();
  await page.getByLabel("Open Today").click();
  await expect(page.getByText("Morning nudge")).toBeVisible();
  await expect(page.getByText("Weekdays - 08:00")).toBeVisible();
});

test("settings can apply a review preset from current usage guidance", async ({ page }) => {
  await page.goto("/");

  await page.getByText("Start privately").click();
  await page.getByLabel("Confidence").click();
  await page.getByLabel("Next").click();
  await page.getByLabel("Mixed signals").click();
  await page.getByLabel("Next").click();
  await page.getByLabel("Simple mode").click();
  await page.getByLabel("Generate Today").click();

  await page.getByLabel("Open Settings").click();
  await expect(page.getByText("Review packets")).toBeVisible();
  await expect(page.getByText("Recommended review setup")).toBeVisible();
  await expect(page.getByText("Lean into weekly packets", { exact: true })).toBeVisible();
  await expect(page.getByText("Section: Overview -> 7 days")).toBeVisible();
  await expect(page.getByText("Format: Snapshot -> Packet")).toBeVisible();
  await page.getByLabel("Apply weekly packet setup").click();
  await expect(page.getByText("Current review settings already match this pattern.")).toBeVisible();
  await page.getByLabel("Open Review").click();
  await expect(page.getByText("Weekly review")).toBeVisible();
  await page.getByLabel("Prepare recap").click();
  await expect(page.getByText("Preview: Packet").first()).toBeVisible();
  await expect(page.getByText("7 days packet")).toHaveCount(2);
});

test("settings can apply a lighter day preset from current guidance", async ({ page }) => {
  await page.goto("/");

  await page.getByText("Start privately").click();
  await page.getByLabel("Confidence").click();
  await page.getByLabel("Next").click();
  await page.getByLabel("Mixed signals").click();
  await page.getByLabel("Next").click();
  await page.getByLabel("Simple mode").click();
  await page.getByLabel("Generate Today").click();

  await page.getByLabel("Open Settings").click();
  await expect(page.getByText("Should I simplify today?")).toBeVisible();
  await expect(page.getByText("A lighter preset is ready if you want the app to trim today's scope for you.")).toBeVisible();
  await expect(page.getByText("Today: up to 2 of 4 priority actions stay visible.")).toBeVisible();
  await expect(page.getByText("Programs: up to 2 of 3 tasks stay visible.")).toBeVisible();
  await page.getByLabel("Use lighter day").click();
  await expect(page.getByText("Current lighter day looks optional now.")).toBeVisible();
  await expect(
    page.getByText("This looks like a one-day support reset. If today's signal feels quiet again, you can return to the full day."),
  ).toBeVisible();
  await expect(page.getByText("Use it when the day tightens, then return to the full plan once the signal is quiet again.")).toBeVisible();
  await expect(page.getByLabel("Return to full day")).toBeVisible();
  await page.getByLabel("Open Today").click();
  await expect(page.getByText("Lighter day is on").first()).toBeVisible();
});

test("programs can switch on a lighter day plan and today can restore it", async ({ page }) => {
  await page.goto("/");

  await page.getByText("Start privately").click();
  await page.getByLabel("Confidence").click();
  await page.getByLabel("Next").click();
  await page.getByLabel("Mixed signals").click();
  await page.getByLabel("Next").click();
  await page.getByLabel("Simple mode").click();
  await page.getByLabel("Generate Today").click();

  await page.getByLabel("Open Programs").click();
  await expect(page.getByLabel("Use lighter day")).toBeVisible();
  await page.getByLabel("Use lighter day").click();
  await expect(page.getByText("Lighter day is on").first()).toBeVisible();
  await expect(page.getByText("Showing 2 tasks in the lighter day plan.")).toBeVisible();
  await expect(page.getByText("1 more task is hidden for later.")).toBeVisible();

  await page.getByLabel("Open Today").click();
  await expect(page.getByText("Lighter day is on").first()).toBeVisible();
  await expect(page.getByText("Showing 2 priority actions for today.")).toBeVisible();
  await expect(page.getByText("2 more actions are hidden for later.")).toBeVisible();
  await expect(page.getByText("Keep to two calm scores")).toBeVisible();
  await expect(page.getByText("Use two calm scores first. Add anything else only if the day stays quiet.")).toBeVisible();
  await expect(page.getByText("Showing 2 of 4 quick logs today.")).toBeVisible();
  await expect(page.getByLabel("Quick log Confidence")).toBeVisible();
  await expect(page.getByLabel("Quick log Libido")).toBeVisible();
  await expect(page.getByLabel("Quick log Morning")).toHaveCount(0);
  await expect(page.getByLabel("Quick log Symptoms")).toHaveCount(0);
  await page.getByLabel("Open Review").click();
  await expect(page.getByText("Lighter day review")).toBeVisible();
  await expect(page.getByText("Used as support")).toBeVisible();
  await expect(page.getByText("Pattern: one-off support day")).toBeVisible();
  await expect(page.getByText("Lighter days: 1/7 - Current streak: 1 day")).toBeVisible();
  await expect(page.getByText("Today: 0 - Programs: 1")).toBeVisible();
  await page.getByLabel("Open recap format: Packet").click();
  await page.getByLabel("Prepare recap").click();
  await expect(page.getByText("Preview: Packet").first()).toBeVisible();
  await expect(page.getByText("Lighter day review", { exact: true }).nth(1)).toBeVisible();
  await expect(page.getByText("Pattern: one-off support day").nth(1)).toBeVisible();
  await page.getByLabel("Open Today").click();
  await page.getByLabel("Return to full day").click();
  await expect(page.getByLabel("Use lighter day")).toBeVisible();
  await expect(page.getByText("Showing 2 priority actions for today.")).toHaveCount(0);
  await expect(page.getByLabel("Quick log Morning")).toBeVisible();
  await expect(page.getByLabel("Quick log Libido")).toBeVisible();
  await expect(page.getByLabel("Quick log Symptoms")).toBeVisible();
});

test("coach can suggest when to simplify the whole day", async ({ page }) => {
  await page.goto("/");

  await page.getByText("Start privately").click();
  await page.getByLabel("Confidence").click();
  await page.getByLabel("Next").click();
  await page.getByLabel("Mixed signals").click();
  await page.getByLabel("Next").click();
  await page.getByLabel("Simple mode").click();
  await page.getByLabel("Generate Today").click();

  await page.getByLabel("Open Coach").click();
  await expect(page.getByText("Should I simplify today?")).toBeVisible();
  await page.getByLabel("Open coach question: Should I simplify today?").click();
  await expect(
    page.getByText("Keep today narrow. The signal is still thin enough that extra effort will add noise faster than clarity."),
  ).toBeVisible();
  await expect(
    page.getByText("Land the morning anchor, log two calm scores, and stop there unless the day stays quiet."),
  ).toBeVisible();
  await expect(page.getByText("A lighter preset is ready if you want the app to trim today's scope for you.")).toBeVisible();
  await page.getByLabel("Use lighter day").click();
  await expect(
    page.getByText("This looks like a one-day support reset. If today's signal feels quiet again, you can return to the full day."),
  ).toBeVisible();
  await expect(page.getByText("Current lighter day looks optional now.")).toBeVisible();
  await expect(page.getByLabel("Return to full day")).toBeVisible();
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
  await expect(page.getByText("Preview: Packet").first()).toBeVisible();
  await expect(page.getByText("Cycles packet")).toHaveCount(2);
  await expect(page.getByText("History snapshot", { exact: true })).toHaveCount(2);
  await expect(page.getByText("Latest completed cycle: 14-day confidence reset")).toHaveCount(3);
  await expect(page.getByText("Recent packets")).toBeVisible();
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
  await page.getByLabel("Открыть Коуча").click();
  await expect(page.getByText("Коуч").first()).toBeVisible();
  await expect(page.getByText("Быстрые вопросы")).toBeVisible();
  await expect(page.getByText("Следующий мягкий шаг")).toBeVisible();
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
