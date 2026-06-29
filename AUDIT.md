# Marvel Reading Vault v4 Audit

Build date: 2026-06-28

## Catalogue integrity

- Phases: 10
- Series records: 626
- Canonical issue records: 9,129
- Run/event/story records: 399
- Structured events: 56
- Character/team roadmaps: 67
- Duplicate item IDs: 0
- Missing canonical issue references: 0

## Route integrity

- Run blocks are generated at a target size of 6–12 issues.
- A short miniseries or final remainder can remain below six issues rather than being split unnaturally.
- No generated run block exceeds 15 issues.
- Event gates own their crossover issue IDs within a phase.
- Shared event issues are removed from surrounding run blocks to prevent repeated reading entries.
- Phase and chapter totals use unique published issue IDs.
- Solicited/upcoming issues do not count toward completion.

## Default Master Flow

The default selected lanes are:

- X-Men
- Spider-Man
- Daredevil
- Fantastic Four
- Avengers
- Thor
- Hulk
- Iron Man
- Captain America
- Thunderbolts

Additional lanes can be toggled from the Master Flow without changing canonical progress.

## Browser testing

The site was rendered in headless Chromium with:

- Dashboard rendering
- Master Flow phase navigation
- Interleaved run blocks
- Event gates
- Lane toggles
- Roadmap family filters
- Character roadmap tabs
- Worthwhile Optional tabs
- Dark-theme layout

No runtime JavaScript errors were observed during the final rendering test.

## v4.1 interface audit

- Active Reading Lanes includes Select all and Clear all.
- Empty lane selections persist and no longer fall back to core lanes.
- Phase controls and headings expose the phase year range.
- Master Flow segments expose writer, run years and phase period.
- Run/event cards explicitly label writer and date metadata.
- JavaScript syntax checks passed for app.js, catalog.js and expansions.js.
