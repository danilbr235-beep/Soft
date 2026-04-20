# Today Screen Contract

Today is the operational home screen.

Required hierarchy:

1. Top status bar
2. Current priority card
3. Daily state snapshot
4. Alert strip
5. Daily action cards
6. Quick log row
7. Live updates
8. Optional secondary insights

## Behavior

- Show one dominant priority.
- The top status bar must summarize mode, sync state, privacy state, and active program.
- Render cached or mock payload immediately.
- Refresh progressively after logs or sync.
- Keep Simple mode sparse.
- Make alerts severity-aware.
- Keep quick logs as one-tap entry points.
- Never make appearance, pump, device, or supplement content dominate unless the rule engine marks it relevant.
