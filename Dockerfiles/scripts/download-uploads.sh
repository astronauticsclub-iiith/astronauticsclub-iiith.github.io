#!/bin/bash
# Script to download all content from uploads volume as a zip file

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="./downloads/uploads_$TIMESTAMP.zip"
UPLOADS_VOLUME="uploads_data"
TEMP_DIR="/tmp/uploads_download_$TIMESTAMP"

# Create downloads directory if it doesn't exist
mkdir -p ./downloads

# Create temporary directory
mkdir -p "$TEMP_DIR"

echo "Downloading content from uploads volume..."

# Copy files from Docker volume to temporary directory
docker run --rm -v "$UPLOADS_VOLUME:/data" -v "$TEMP_DIR:/backup" alpine sh -c "cp -R /data/* /backup/ 2>/dev/null || true"

# Create zip archive
cd "$TEMP_DIR" && zip -r "$OUTPUT_FILE" . 2>/dev/null

# Clean up
rm -rf "$TEMP_DIR"

echo "Download created at: $OUTPUT_FILE"

# Log the download action
mkdir -p ./logs
LOG_FILE="./logs/persistent_log.json"
if [ ! -f "$LOG_FILE" ]; then
  echo '{"logs":[]}' > "$LOG_FILE"
fi

# Generate timestamp
TIMESTAMP_ISO=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ACTION="Download created"
DETAILS="File: $OUTPUT_FILE"

# Add log entry
TMP_FILE=$(mktemp)
jq ".logs += [{\"timestamp\":\"$TIMESTAMP_ISO\",\"action\":\"$ACTION\",\"details\":\"$DETAILS\"}]" "$LOG_FILE" > "$TMP_FILE" && mv "$TMP_FILE" "$LOG_FILE"
