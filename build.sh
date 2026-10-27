#!/usr/bin/env bash
# Deploy aryadubey.tech (Next.js + Payload) on the VPS.
# Called by .github/workflows/deploy.yml after `git pull`.
#
#   /var/www/aryadubey                  git checkout (this repo, where we build)
#   /var/www/aryadubey-shared/.env      secrets + config (never in git)
#   /var/www/aryadubey-shared/media     CMS uploads (survive every deploy)
#   /var/www/aryadubey-releases/<sha>   one self-contained server per build
#   /var/www/aryadubey-releases/current symlink to the live release
set -euo pipefail

APP=/var/www/aryadubey
SHARED=/var/www/aryadubey-shared
RELEASES=/var/www/aryadubey-releases
cd "$APP"

set -a; source "$SHARED/.env"; set +a
export GIT_SHA="$(git rev-parse --short HEAD)"
export BUILT_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
export NEXT_TELEMETRY_DISABLED=1

echo "==> Installing dependencies"
# devDependencies are needed to build (Tailwind, TypeScript)
NODE_ENV=development npm ci --no-audit --no-fund

echo "==> Migrating the database"
npm run migrate

echo "==> Seeding (fills only what is empty)"
npm run seed

echo "==> Building $GIT_SHA"
npm run build

echo "==> Assembling release"
REL="$RELEASES/$GIT_SHA-$(date +%s)"
mkdir -p "$REL"
cp -a .next/standalone/. "$REL/"
# file tracing copies sharp's .node binding but not the libvips library beside it
rm -rf "$REL/node_modules/sharp" "$REL/node_modules/@img"
cp -a node_modules/sharp "$REL/node_modules/sharp"
cp -a node_modules/@img "$REL/node_modules/@img"
mkdir -p "$REL/.next"
cp -a .next/static "$REL/.next/static"
[ -d public ] && cp -a public "$REL/public"
ln -sfn "$REL" "$RELEASES/current"

echo "==> Installing service unit"
if ! sudo cmp -s deploy/aryadubey.service /etc/systemd/system/aryadubey.service; then
  sudo install -m 644 deploy/aryadubey.service /etc/systemd/system/aryadubey.service
  sudo systemctl daemon-reload
fi

echo "==> Restarting"
sudo systemctl restart aryadubey

echo "==> Health check"
for i in $(seq 1 30); do
  if curl -fsS -o /dev/null "http://127.0.0.1:${PORT:-3000}/"; then
    echo "    up after ${i}s"
    break
  fi
  if [ "$i" = 30 ]; then
    echo "!! site did not come up"; sudo journalctl -u aryadubey -n 40 --no-pager; exit 1
  fi
  sleep 1
done

echo "==> Pruning old releases (keeping 3)"
ls -1dt "$RELEASES"/*/ 2>/dev/null | grep -v '/current/$' | tail -n +4 | xargs -r rm -rf

echo "==> Deploy complete: $GIT_SHA"
