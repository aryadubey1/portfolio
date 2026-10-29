#!/usr/bin/env bash
# Put a saved design back into src/ (then commit and push to make it live)
#   bash designs/restore.sh atlas-v1
set -euo pipefail
cd "$(dirname "$0")/.."
name="${1:?usage: bash designs/restore.sh <name>}"
src="designs/$name"
[ -d "$src/src" ] || { echo "no design called $name"; ls designs; exit 1; }
grep -v '^#' designs/files.txt | while read -r f; do
  [ -z "$f" ] && continue
  rm -rf "$f"
  [ -e "$src/$f" ] && { mkdir -p "$(dirname "$f")"; cp -a "$src/$f" "$f"; }
done
echo "restored $name into src/. Check it with: npm run dev"
