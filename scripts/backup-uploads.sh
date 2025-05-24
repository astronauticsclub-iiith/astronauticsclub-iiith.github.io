#!/bin/bash
# Script to backup uploads volume to a zip file

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/uploads_backup_$TIMESTAMP.zip"
UPLOADS_VOLUME="uploads_data"
TEMP_DIR="/tmp/uploads_backup_$TIMESTAMP"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create temporary directory
mkdir -p "$TEMP_DIR"

echo "Creating backup of uploads volume..."

# Copy files from Docker volume to temporary directory
docker run --rm -v "$UPLOADS_VOLUME:/data" -v "$TEMP_DIR:/backup" alpine sh -c "cp -R /data/* /backup/ 2>/dev/null || true"

# Create zip archive
cd "$TEMP_DIR" && zip -r "$BACKUP_FILE" . 2>/dev/null

# Clean up
rm -rf "$TEMP_DIR"

echo "Backup created at: $BACKUP_FILE"

# Log the backup action
mkdir -p ./logs
LOG_FILE="./logs/persistent_log.json"
if [ ! -f "$LOG_FILE" ]; then
  echo '{"logs":[]}' > "$LOG_FILE"
fi

# Generate timestamp
TIMESTAMP_ISO=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ACTION="Backup created"
DETAILS="Backup file: $BACKUP_FILE"

# Add log entry
TMP_FILE=$(mktemp)
jq ".logs += [{\"timestamp\":\"$TIMESTAMP_ISO\",\"action\":\"$ACTION\",\"details\":\"$DETAILS\"}]" "$LOG_FILE" > "$TMP_FILE" && mv "$TMP_FILE" "$LOG_FILE"
