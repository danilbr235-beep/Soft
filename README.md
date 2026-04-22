# Private Men's Health Coach

Privacy-first mobile MVP for daily men's health tracking, recovery guidance, learning, and conservative coaching explanations.

This repository replaces the previous goals-manager prototype with a production-minded Expo + TypeScript monorepo scaffold.

## What This MVP Does

- Opens into a calm mobile app shell with onboarding and bottom navigation.
- Renders a Today screen from deterministic mock/rules data.
- Supports fast quick-log entry points for high-signal daily tracking.
- Shows a compact Today status row for mode, sync, privacy, and active program state.
- Lets the shared review digest steer Today priority CTA and daily action-card emphasis.
- Includes a curated Learn hub with Today-aware recommendations, categories, detail pages, starter Programs, Coach quick explanations, and Settings/Privacy surfaces.
- Lets Learn recommendations follow the shared review digest, not only the current Today priority.
- Lets Coach quick answers use the shared review digest so "why" and "what next" stay aligned with the broader read.
- Provides a mock API contract for `GET /today`, `POST /logs`, `GET /programs`, `GET /content/featured`, and `POST /coach/explain-priority`.
- Keeps quick-log writes local-first with a sync queue and a demo sync-clear flow.
- Turns onboarding answers into a persisted profile, baseline, privacy defaults, and starter program.
- Supports English/Russian localization for the app shell, Today rules, Coach explanations, quick logs, and core content.
- Summarizes local Track history into a baseline snapshot with recent counts, score averages, latest values, filters, edit/delete actions, and JSON export preview.
- Adds weekly Track snapshot cards for sleep, energy, confidence, libido, and symptoms.
- Adds a dedicated Review surface with a consolidated digest that merges week, 30-day, and recent cycle context into one conservative read.
- Adds a weekly Review read that combines recent logs with recent program-cycle context into one conservative summary.
- Adds a 30-day Review read that gives a broader period view across recent logs and completed cycles.
- Adds conservative Track pattern hints from paired recent logs without causal claims.
- Adds varied Programs day plans with task-level local checklist progress, rest days, and progress summaries.
- Adds a Programs detail view with phase, pace, progress summary, and the active checklist.
- Adds Programs adjustment guidance from Today rules, with a conservative next step and lighter-plan fallback.
- Adds skip, pause, and resume controls for Programs without losing the current day context.
- Adds a completion wrap-up for finished Programs with a conservative next step based on the cycle outcome.
- Recommends one or two next program paths after completion based on how the cycle ended.
- Lets the user start a recommended next program directly from the completion wrap-up.
- Keeps a local history of finished program cycles after the user switches into the next one.
- Summarizes recent finished cycles into a compact Review surface with a conservative read of the pattern.
- Keeps finished-cycle review logic reusable and adds a simple recent-direction trend over the last cycles.
- Moves the shared digest, weekly review, monthly review, and cycle review into a dedicated Review tab.
- Reuses the same review digest inside Programs so plan decisions and Track summaries point to one shared conservative read.
- Lets the shared review digest steer Programs adjustments and recommended next paths instead of staying read-only.
- Adds a Track weekly review card that merges recent logs and recent cycle context into one weekly summary.
- Adds a Track 30-day review card for a broader monthly-style summary without leaving the Track surface.
- Adds a local demo PIN flow for the privacy vault while keeping production secure storage out of MVP scope.
- Auto-locks the privacy vault after a short inactivity window in the local demo.
- Shows a startup loading state and recovery screen instead of leaving users on a blank page.
- Includes Playwright web smoke tests for onboarding, Today, quick logging, Learn recommendations/detail/progress, Programs checklist, language switching, and sync status.

## What This MVP Does Not Do

- It is not a diagnostic tool.
- It does not provide medical certainty or treatment instructions.
- It does not include real auth, Supabase, HealthKit, Google Fit, labs parsing, AI/RAG, or production sync yet.

## Structure

```text
apps/
  api/       Mock Fastify API contract
  mobile/    Expo React Native app
packages/
  onboarding/Onboarding result and starter-program routing
  rules/     Deterministic Today rule engine
  sync/      Local-first sync queue helpers
  types/     Shared domain contracts
  ui/        Shared design tokens
docs/
  product/   Product brief
  operations/Blank-screen recovery and local run troubleshooting
  contracts/ Today/onboarding contracts
  architecture/ Build plan
```

## Commands

```powershell
npm.cmd install
npm.cmd test
npm.cmd run typecheck
npm.cmd run smoke:web
npm.cmd run api
npm.cmd run mobile
```

Use `npm.cmd` in PowerShell if `npm.ps1` is blocked by Windows execution policy.

## Current Vertical Slice

The app now supports:

1. Welcome and privacy framing.
2. Goal selection.
3. Baseline preset.
4. Simple/Pro mode selection.
5. Persisted onboarding result.
6. Today generation from the selected profile and starter program.
7. Quick log save into local storage.
8. Pending sync queue state.
9. Demo sync-clear flow on Track.
10. English/Russian language switch in onboarding and Settings.
11. Track baseline snapshot from local quick logs.
12. Programs day plans with conservative tasks, saved checklist state, rest days, and summary counts.
13. Startup recovery path for corrupted local demo state or render failures.
14. Track history filters, local edit/delete, and JSON export preview.
15. Learn recommendations from Today state, topic filters, detail pages, and saved/completed progress.
16. Privacy vault PIN setup, wrong-PIN feedback, and PIN unlock in the local demo.
17. Privacy vault auto-lock after local inactivity.
18. Coach quick questions for priority, alerts, confidence, and the next conservative step.
19. Today status row for mode, sync, privacy vault state, and active program.
20. Track weekly snapshot cards with conservative low-data and caution states.
21. Track pattern hints for paired signals, with low-data fallback and no causal claims.
22. Programs detail view with a conservative phase summary and current-day checklist.
23. Programs adjustment guidance from current Today priority and alerts.
24. Programs skip and pause/resume flow with preserved local progress.
25. Programs completion wrap-up with steady/mixed/recovery endings, a conservative next step, dynamic next-path recommendations, one-tap program switching, local cycle history, and a compact cycle review.
26. Dedicated Review tab with recent cycle totals, leading outcome, and a simple trend label shared across the app.
27. Review weekly summary with one conservative weekly read across recent logs and recent cycle context.
28. Review 30-day summary with a broader period read across recent logs and recent cycle completions.
29. Review digest with one consolidated read across week, 30-day review, and recent cycle context.
