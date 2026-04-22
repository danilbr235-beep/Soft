# Product Roadmap

This roadmap keeps the MVP moving in controlled layers: stability first, then deeper tracking, programs, content, privacy, backend, and only later AI or device integrations.

## P0 Stability Pack

- Add a startup loading state while local storage is being hydrated.
- Show an app recovery screen instead of a blank page when rendering fails.
- Clear only Soft-owned local storage keys during recovery.
- Keep unrelated browser or device storage untouched.
- Preserve smoke coverage for corrupted local storage and forced startup recovery.
- Document what to check when `localhost` opens to a blank page.
- Add CI so `test`, `typecheck`, `smoke:web`, and web export run before merges.

## P1 Today

- Make Today the operational source of truth for the app.
- Strengthen the status row with privacy, sync, mode, and active program state. (Initial slice complete.)
- Recompute priority after every supported quick log.
- Add clearer low-data states instead of overconfident recommendations.
- Keep alerts severity-aware and visually distinct.
- Add secondary insights only when there is enough signal.
- Keep Simple mode sparse and Pro mode more detailed.

## P1 Track

- Add a log history view with filters by signal type. (Initial slice complete.)
- Support edit and delete for local logs. (Initial slice complete.)
- Add weekly snapshots for sleep, energy, confidence, libido, and symptoms. (Initial slice complete.)
- Add a consolidated review digest so Track can summarize week, 30-day context, and recent cycles in one read. (Initial slice complete.)
- Reuse the same review digest inside Programs so plan guidance and Track stay aligned. (Initial slice complete.)
- Add a weekly review layer that turns recent logs and cycle context into one conservative summary. (Initial slice complete.)
- Add a broader 30-day review so Track can summarize beyond the last week without a separate analytics surface. (Initial slice complete.)
- Show conservative correlation hints without pretending causality. (Initial paired-log hints slice complete.)
- Surface recent finished-program review inside Track so cycle context is visible next to daily logs. (Initial reusable review slice complete.)
- Add CSV/JSON export for local data. (JSON preview complete.)
- Keep quick logs low-friction and one-handed on mobile.

## P1 Programs

- Add a program detail screen. (Initial detail slice complete.)
- Give each day its own task plan instead of repeating the same daily template. (Initial varied day-plan slice complete.)
- Support skip, rest day, and pause without shame-oriented copy. (Initial skip/rest/pause slice complete.)
- Track completed, skipped, and recovery-only days. (Completed/rest/skipped summary complete.)
- Recommend program adjustments from rule outputs. (Initial slice complete.)
- Add completion summaries with a conservative next step. (Completion summary slice complete.)
- Recommend one or two next paths after completion based on the cycle outcome. (Initial dynamic next-path slice complete.)
- Let users start the recommended next path directly from the wrap-up. (Initial one-tap switch slice complete.)
- Preserve finished cycles in local history after each switch so later reviews have real program transitions. (Initial local history slice complete.)
- Add a compact review of recent cycles so Programs can summarize pattern direction before a fuller Review surface exists. (Initial cycle-review slice complete.)
- Add a simple recent-direction trend over the last cycles and keep that review logic reusable outside Programs. (Initial trend/reuse slice complete.)

## P1 Learn Hub

- Add content detail pages. (Initial slice complete.)
- Group content by baseline, recovery, sleep, pelvic floor, confidence, privacy, and safety. (Initial topic filter slice complete.)
- Support saved, completed, and recommended content states. (Initial slice complete.)
- Localize core Learn content into natural Russian, not literal translation.
- Tie featured content to Today state and active program. (Initial deterministic recommendation slice complete.)
- Keep trust level and source metadata visible.

## P1 Coach

- Keep Coach as a rules explanation layer, not a medical AI.
- Add quick questions for priority, alert, data confidence, and next step. (Initial rules-first slice complete.)
- Say clearly when there is not enough data. (Initial slice complete.)
- Prefer conservative next steps over intensity. (Initial slice complete.)
- Add tests that block diagnostic or shame-oriented language. (Initial slice complete.)
- Prepare the interface for future AI/RAG without depending on it.

## P1 Privacy

- Add a real PIN lock for sensitive app sections. (Local demo PIN slice complete; production secure storage still later.)
- Add biometric unlock later for iOS and Android.
- Support automatic lock after inactivity. (Initial local inactivity timer complete.)
- Add discreet notification copy and hidden-label mode.
- Add a clear-data flow with export-before-delete.
- Move sensitive lock state into secure storage when native builds are ready.

## P1 Localization

- Audit every user-facing string in English and Russian.
- Add pluralization helpers for Russian counts.
- Test that both languages expose the same copy keys.
- Keep medical boundary copy direct but not frightening.
- Replace remaining robotic phrases with warmer Russian.
- Add localization coverage for program tasks, Learn content, Coach explanations, and safety alerts.

## P2 Backend And Sync

- Add schema validation for every API request and response.
- Keep mock API compatibility while introducing real persistence.
- Add Supabase/Postgres for profile, logs, program progress, content progress, and sync jobs.
- Define conflict handling for local-first sync.
- Add retry and backoff telemetry for sync queue jobs.
- Split dev, staging, and production environment configuration.

## P2 Data Model

- Version local storage schemas and run explicit migrations.
- Keep logs as append-only events where possible.
- Store program day history separately from current progress.
- Keep public content metadata separate from sensitive user state.
- Add audit-friendly sync job metadata.
- Make exports readable without exposing hidden implementation details.

## P2 Safety

- Expand symptom check-in coverage for pain, numbness, blood, injury concern, and sudden worsening.
- Route high-priority safety signals into conservative alerts.
- Suppress aggressive practice when caution signals are present.
- Add a safety policy document.
- Test for no diagnosis, no treatment promises, no body shaming, and no performance shaming.

## P2 Release Readiness

- Add app icon, splash screen, and release metadata.
- Create Android internal testing builds.
- Prepare iOS TestFlight after native privacy and secure storage are ready.
- Draft privacy policy and store listing copy.
- Add a beta feedback route.
- Keep claims educational and tracking-focused.

## P3 Later Integrations

- HealthKit and Google Fit imports.
- Wearable sleep and recovery signals.
- Labs parser.
- Supplement tracker.
- Device routine tracking with strict caution rules.
- AI/RAG over reviewed content with safety guardrails.
- Weekly and monthly reports.
- Optional clinician/export mode.

## Recommended Build Order

1. Finish P0 Stability Pack.
2. Build Track 2.0: history, edit/delete, weekly snapshot, export.
3. Build Programs 2.0: detail screen, varied day plans, skip/rest, summaries.
4. Build deeper Learn detail pages, more content, and Russian content polish.
5. Harden privacy lock with secure storage and native unlock.
6. Add backend and production sync.
7. Add AI/RAG and device integrations only after safety and content foundations are strong.
