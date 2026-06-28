# Marvel Reading Vault v4

A static HTML/CSS/JavaScript Marvel reading tracker designed around short interleaved reading blocks rather than giant uninterrupted title dumps.

## Open the site

Extract the ZIP and open `index.html` in a modern browser.

## Main changes in v4

- Master Flow switches between runs in roughly 6–12 issue blocks.
- Core events appear inside the route as event gates.
- Shared crossover issues retain one canonical issue ID and one progress record.
- Event issues are removed from duplicate run blocks within the same phase.
- Each phase is divided into smaller reading chapters.
- The Master Flow opens one phase at a time by default, with quick phase tabs.
- Active reading lanes can be toggled, allowing a focused or wider interleaved route.
- Character pages have Main Route, Worthwhile Optional, Events & Crossovers, and Great Stories tabs.
- Skim and Skip material is excluded from normal route modes.
- Main Route includes Peak, Essential, Recommended, and published Current material.
- Expanded Route adds Worthwhile Optional material.
- The Ultimate Universe and Elseworlds remain separate.

## Added and expanded roadmaps

- She-Hulk
- Black Widow
- Ant-Man
- Wasp
- New Mutants
- X-Force
- Excalibur
- Storm
- Nightcrawler
- Emma Frost / Generation X
- Rogue and Gambit
- Alpha Flight
- Hellions
- Spider-Family
- Miles Morales
- Spider-Gwen / Ghost-Spider
- Spider-Man 2099
- Spider-Woman
- Black Cat
- Scarlet Spiders
- Silk
- Spider-Girl
- Spider-Man Noir and Spider-Punk

## Progress storage

Issue progress is stored by canonical issue ID in IndexedDB. The v4 build intentionally uses the same progress database as v3 so existing v3 issue checkmarks remain available where the browser permits it.

Settings such as theme, active lanes, route mode, and selected roadmap are stored separately.

Use Settings > Export backup regularly to create a portable JSON copy.

## Files

- `index.html`: application shell
- `css/style.css`: visual design and responsive layout
- `js/catalog.js`: original canonical issue catalogue
- `js/expansions.js`: v4 roadmap additions and phase/chapter configuration
- `js/app.js`: rendering, route generation, progress storage, search, filters and interactions
- `AUDIT.md`: build audit summary
