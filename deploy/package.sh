#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(node -p "require('${ROOT}/package.json').version" 2>/dev/null || echo 0.1.0)"
OUT_DIR="${ROOT}/release"
STAMP="$(date +%Y%m%d)"
ARCHIVE="${OUT_DIR}/customer-butler-${VERSION}-${STAMP}.tar.gz"

mkdir -p "$OUT_DIR"

log() { printf '[package] %s\n' "$*"; }

log "打包 Web 服务端安装包 v${VERSION}..."

tar -czf "$ARCHIVE" \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='.env.*.local' \
  --exclude='prisma/dev.db' \
  --exclude='prisma/dev.db-journal' \
  --exclude='prisma/production.db' \
  --exclude='prisma/production.db-journal' \
  --exclude='coverage' \
  --exclude='release' \
  --exclude='mobile' \
  --exclude='.DS_Store' \
  --exclude='*.tsbuildinfo' \
  -C "$ROOT" \
  .

log "完成: ${ARCHIVE}"
ls -lh "$ARCHIVE"
