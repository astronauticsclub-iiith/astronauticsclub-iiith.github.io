#!/bin/bash
# Script to upload local files to the uploads volume

if [ -z "$1" ]; then
  echo "Error: Source directory is required."
  echo "Usage: $0 <source_directory>"
  exit 1
fi

SOURCE_DIR="$1"
UPLOADS_VOLUME="uploads_data"
TEMP_DIR="/tmp/uploads_upload_$(date +%Y%m%d_%H%M%S)"

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: Source directory does not exist: $SOURCE_DIR"
  exit 1
fi

# Create temporary directory
mkdir -p "$TEMP_DIR"

echo "Uploading files from $SOURCE_DIR to uploads volume..."

# Copy files from source to temporary directory
cp -R "$SOURCE_DIR"/* "$TEMP_DIR"/ 2>/dev/null || true

# Copy files to Docker volume
docker run --rm -v "$UPLOADS_VOLUME:/data" -v "$TEMP_DIR:/backup" alpine sh -c "cp -R /backup/* /data/ 2>/dev/null || true"

# Clean up
rm -rf "$TEMP_DIR"

echo "Files uploaded successfully."

# Log the upload action
mkdir -p ./logs
LOG_FILE="./logs/persistent_log.json"
if [ ! -f "$LOG_FILE" ]; then
  echo '{"logs":[]}' > "$LOG_FILE"
fi

# Generate timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ACTION="Files uploaded"
DETAILS="From directory: $SOURCE_DIR"

# Add log entry
TMP_FILE=$(mktemp)
jq ".logs += [{\"timestamp\":\"$TIMESTAMP\",\"action\":\"$ACTION\",\"details\":\"$DETAILS\"}]" "$LOG_FILE" > "$TMP_FILE" && mv "$TMP_FILE" "$LOG_FILE"
