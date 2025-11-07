#!/bin/bash
# Script to restore logs from a backup zip file

if [ -z "$1" ]; then
  echo "Error: Backup file path is required."
  echo "Usage: $0 <backup_file_path>"
  exit 1
fi

BACKUP_FILE="$1"
LOGS_VOLUME="logs_data"
TEMP_DIR="/tmp/logs_restore_$(date +%Y%m%d_%H%M%S)"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file does not exist: $BACKUP_FILE"
  exit 1
fi

# Create temporary directory
mkdir -p "$TEMP_DIR"

echo "Restoring logs from $BACKUP_FILE..."

# Extract zip archive to temporary directory
unzip -q "$BACKUP_FILE" -d "$TEMP_DIR"

# Copy files to Docker volume
docker run --rm -v "$LOGS_VOLUME:/data" -v "$TEMP_DIR:/backup" alpine sh -c "rm -rf /data/* && cp -R /backup/* /data/ 2>/dev/null || true"

# Clean up
rm -rf "$TEMP_DIR"

echo "Logs restored successfully."

# Log the restore action
./scripts/log-action.sh "Logs restored" "From backup: $BACKUP_FILE"
