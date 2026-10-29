# Designs

Every design aryadubey.tech has worn, kept in full so none is ever lost
and any can be switched back on.

Each folder holds a complete copy of that design's frontend (pages,
components, styles, wording) plus a README describing the look. The
files that count as "the design" are listed in `files.txt`. The CMS,
database and deploy setup are shared by all designs.

| Design | Dates | Look | Wording |
| --- | --- | --- | --- |
| [atlas-v1](atlas-v1/) | 2026-10-28 | Watercolour sea, project islands, boat lane | Personal portfolio |
| [atlas-v2-services](atlas-v2-services/) | 2026-10-29 (never live) | Atlas + a whale that swims with scroll | Offering services |
| [services-wording](services-wording/) | 2026-10-29 | Atlas with services wording, whale removed | Offering services |
| atlas-device-scenes **(live)** | 2026-10-29 → | Atlas + pinned laptop/phone scenes of live work, scrubbed by scroll | Offering services |

Every design is also a git tag (`design/<name>`) on its last commit.

## Switch to a saved design

```bash
bash designs/restore.sh atlas-v1   # copies it into src/
npm run dev                        # look at it
git commit -am "Switch to atlas-v1" && git push   # make it live
```

The headline words live in the CMS. After switching, change them in
`/admin` → Site words if they should match the design.

## Before starting a new design

Save the current one first, so it is never lost:

```bash
bash designs/save.sh <new-name-for-what-is-live-now>
git tag -a design/<name> -m "short description"
```

Then fill in its README and add a row to the table above.

These copies are archives: they are not typechecked or built
(`tsconfig.json` and Tailwind skip this folder).
