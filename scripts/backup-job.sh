#!/bin/bash
set -euo pipefail # Abort on any failure

# Resolve repo root relative to this script, regardless of cwd
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$REPO_ROOT"

make init-backup
make backup-uploads
make backup-logs