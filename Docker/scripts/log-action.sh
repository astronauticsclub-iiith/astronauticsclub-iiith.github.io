#!/bin/bash
# Script to log actions to a persistent JSON log file that survives updates

LOG_FILE="./logs/persistent_log.json"
ACTION="$1"
DETAILS="$2"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Ensure the log file exists
mkdir -p ./logs
if [ ! -f "$LOG_FILE" ]; then
  echo '{"logs":[]}' > "$LOG_FILE"
fi

# Generate new log entry
NEW_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"action\":\"$ACTION\",\"details\":\"$DETAILS\"}"

# Add the new entry to the log file
# Using temporary file to ensure the file is not corrupted if the script is interrupted
TMP_FILE=$(mktemp)
jq ".logs += [$NEW_ENTRY]" "$LOG_FILE" > "$TMP_FILE" && mv "$TMP_FILE" "$LOG_FILE"

echo "Action logged: $ACTION - $DETAILS"
