#!/bin/bash
# Script to restore uploads from a backup zip file

if [ -z "$1" ]; then
  echo "Error: Backup file path is required."
  echo "Usage: $0 <backup_file_path>"
  exit 1
fi

BACKUP_FILE="$1"
UPLOADS_VOLUME="uploads_data"
TEMP_DIR="/tmp/uploads_restore_$(date +%Y%m%d_%H%M%S)"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file does not exist: $BACKUP_FILE"
  exit 1
fi

# Create temporary directory
mkdir -p "$TEMP_DIR"

echo "Restoring uploads from $BACKUP_FILE..."

# Extract zip archive to temporary directory
unzip -q "$BACKUP_FILE" -d "$TEMP_DIR"

# Copy files to Docker volume
docker run --rm -v "$UPLOADS_VOLUME:/data" -v "$TEMP_DIR:/backup" alpine sh -c "rm -rf /data/* && cp -R /backup/* /data/ 2>/dev/null || true"

# Clean up
rm -rf "$TEMP_DIR"

echo "Uploads restored successfully."

# Log the restore action
mkdir -p ./logs
LOG_FILE="./logs/persistent_log.json"
if [ ! -f "$LOG_FILE" ]; then
  echo '{"logs":[]}' > "$LOG_FILE"
fi

# Generate timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ACTION="Uploads restored"
DETAILS="From backup: $BACKUP_FILE"

# Add log entry
TMP_FILE=$(mktemp)
jq ".logs += [{\"timestamp\":\"$TIMESTAMP\",\"action\":\"$ACTION\",\"details\":\"$DETAILS\"}]" "$LOG_FILE" > "$TMP_FILE" && mv "$TMP_FILE" "$LOG_FILE"
