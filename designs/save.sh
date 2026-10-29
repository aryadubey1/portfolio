#!/usr/bin/env bash
# Save the design currently in src/ as designs/<name>/
#   bash designs/save.sh atlas-v3
set -euo pipefail
cd "$(dirname "$0")/.."
name="${1:?usage: bash designs/save.sh <name>}"
dest="designs/$name"
[ -e "$dest/src" ] && { echo "designs/$name already exists; pick a new name"; exit 1; }
grep -v '^#' designs/files.txt | while read -r f; do
  [ -z "$f" ] && continue
  mkdir -p "$dest/$(dirname "$f")"
  cp -a "$f" "$dest/$f"
done
[ -f "$dest/README.md" ] || printf '# %s\n\nSaved %s from commit %s.\n\nDescribe the look here.\n' "$name" "$(date +%F)" "$(git rev-parse --short HEAD)" > "$dest/README.md"
echo "saved to $dest; add a row for it in designs/README.md"
