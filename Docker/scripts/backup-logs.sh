#!/bin/bash
# Script to backup logs volume to a zip file

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/logs_backup_$TIMESTAMP.zip"
LOGS_VOLUME="logs_data"
TEMP_DIR="/tmp/logs_backup_$TIMESTAMP"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create temporary directory
mkdir -p "$TEMP_DIR"

echo "Creating backup of logs volume..."

# Copy files from Docker volume to temporary directory
docker run --rm -v "$LOGS_VOLUME:/data" -v "$TEMP_DIR:/backup" alpine sh -c "cp -R /data/* /backup/ 2>/dev/null || true"

# Create zip archive
cd "$TEMP_DIR" && zip -r "$BACKUP_FILE" . 2>/dev/null

# Clean up
rm -rf "$TEMP_DIR"

echo "Logs backup created at: $BACKUP_FILE"

# Log the backup action
./scripts/log-action.sh "Logs backup created" "Backup file: $BACKUP_FILE"
