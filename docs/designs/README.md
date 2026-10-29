# Design log

Every design the site has worn, kept so any of them can be brought back.
Each one is a git tag on the last commit that shipped it.

| Tag | Dates | Look | Wording |
| --- | --- | --- | --- |
| `design/atlas-v1` | 2026-10-28 | The Atlas | Personal portfolio ("an atlas of things I've built") |
| _current_ (`main`) | 2026-10-29 → | The Atlas + scroll whale | Services ("Your idea, built and brought to life") |

## design/atlas-v1: the Atlas

- **Background:** a WebGL watercolour sea (`src/components/sky/`) that drifts on its own, stirs under the pointer, and drops ink on click. Paper grain on top.
- **Work:** every project is an island card along a wavy sea lane. A small boat sails the lane as you scroll, leaving a wake (`Voyage.tsx`).
- **Hero:** a big headline with a brush stroke behind one word, and a "cartouche" card with a compass needle that follows the mouse, plus soundings (islands / live / tools / ∞) and a legend.
- **Sections:** Currents (things I make, as a drifting ticker), The voyage (four process ports), Questions, and a quote flow where your idea forms a new island as you answer.
- **Day / night and motion switches**, mobile bottom dock with a chart sheet.
- **Type:** Syne (display), Figtree (body), JetBrains Mono (labels). Accent `#2b36d9` by day, `#9aa2ff` by night.
- **Wording:** first person, framed as Arya's personal map of projects.

## Switching designs

Look at an old design locally:

```bash
git fetch --tags
git checkout design/atlas-v1
npm ci && npm run dev
```

Bring it back on the live site (makes a new commit on `main` that restores those files, keeping history):

```bash
git checkout main
git checkout design/atlas-v1 -- src
git commit -m "Switch back to the atlas-v1 design"
git push
```

Hero words live in the CMS. After restoring, set them in `/admin` → Site words if they should change too.

## Saving the current design before a redesign

```bash
git tag -a design/<name> -m "what it looks like"
git push origin design/<name>
```

Then add a row and a short section to this file.
