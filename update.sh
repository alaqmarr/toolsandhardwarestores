#!/usr/bin/env bash
set -euo pipefail

# Tools & Hardware Stores - Server Update & PM2 Restart Script
# Usage: ./update.sh [branch]

APP_NAME="ths"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BRANCH="${1:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo master)}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"

log() {
  printf "\n[%s] %s\n" "$(date '+%Y-%m-%d %H:%M:%S')" "$1"
}

# 1. Backup SQLite database before making any changes
DB_FILE="$SCRIPT_DIR/prisma/database.db"
if [ -f "$DB_FILE" ]; then
  BACKUP_DIR="$SCRIPT_DIR/prisma/backups"
  mkdir -p "$BACKUP_DIR"
  log "Backing up SQLite database to prisma/backups/database-${TIMESTAMP}.db..."
  if command -v node >/dev/null 2>&1 && [ -d "$SCRIPT_DIR/node_modules/better-sqlite3" ]; then
    node -e "const Database=require('better-sqlite3');const db=new Database(process.argv[1]);db.pragma('wal_checkpoint(TRUNCATE)');db.backup(process.argv[2]).then(()=>db.close());" \
      "$DB_FILE" "$BACKUP_DIR/database-${TIMESTAMP}.db"
  else
    cp "$DB_FILE" "$BACKUP_DIR/database-${TIMESTAMP}.db"
  fi
  # Keep only the 5 most recent backups
  ls -1t "$BACKUP_DIR"/database-*.db 2>/dev/null | tail -n +6 | xargs -r rm -f
fi

# 2. Git fetch, stash local tracked changes if any, and pull latest
log "Fetching latest changes from origin..."
git fetch --all --prune

STASHED=0
if ! git diff --quiet || ! git diff --cached --quiet; then
  log "Stashing local tracked modifications..."
  git stash push -m "auto-stash-update-${TIMESTAMP}"
  STASHED=1
fi

log "Pulling origin/${BRANCH}..."
git pull --ff-only origin "$BRANCH"

if [ "$STASHED" -eq 1 ]; then
  log "Note: Local changes were stashed as auto-stash-update-${TIMESTAMP}. Inspect with 'git stash list' if needed."
fi

# 3. Install dependencies
log "Installing npm dependencies..."
npm install

# 4. Prisma generate, schema push & one-time Powerbilt catalog import
log "Generating Prisma client and syncing database schema..."
npx prisma generate
npx prisma db push

log "Running one-time catalog imports (skips automatically if already applied)..."
npm run import:powerbilt
npm run import:dongcheng
npm run import:bosch

# 5. Production build
log "Building Next.js production bundle..."
npm run build

# 6. Restart PM2 instance
if ! command -v pm2 >/dev/null 2>&1; then
  echo "Error: pm2 is not installed or not in PATH." >&2
  exit 1
fi

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  log "Restarting PM2 instance '${APP_NAME}'..."
  pm2 restart "$APP_NAME" --update-env
else
  log "PM2 instance '${APP_NAME}' not found; starting new instance..."
  pm2 start npm --name "$APP_NAME" -- start
fi

pm2 save
pm2 status "$APP_NAME"

log "Update complete! '${APP_NAME}' is live."
