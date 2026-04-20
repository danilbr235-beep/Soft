# Private Men's Health Coach

Privacy-first mobile MVP for daily men's health tracking, recovery guidance, learning, and conservative coaching explanations.

This repository replaces the previous goals-manager prototype with a production-minded Expo + TypeScript monorepo scaffold.

## What This MVP Does

- Opens into a calm mobile app shell with onboarding and bottom navigation.
- Renders a Today screen from deterministic mock/rules data.
- Supports fast quick-log entry points for high-signal daily tracking.
- Includes a curated Learn hub with Today-aware recommendations, categories, detail pages, starter Programs, Coach quick explanations, and Settings/Privacy surfaces.
- Provides a mock API contract for `GET /today`, `POST /logs`, `GET /programs`, `GET /content/featured`, and `POST /coach/explain-priority`.
- Keeps quick-log writes local-first with a sync queue and a demo sync-clear flow.
- Turns onboarding answers into a persisted profile, baseline, privacy defaults, and starter program.
- Supports English/Russian localization for the app shell, Today rules, Coach explanations, quick logs, and core content.
- Summarizes local Track history into a baseline snapshot with recent counts, score averages, latest values, filters, edit/delete actions, and JSON export preview.
- Adds varied Programs day plans with task-level local checklist progress, rest days, and progress summaries.
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
