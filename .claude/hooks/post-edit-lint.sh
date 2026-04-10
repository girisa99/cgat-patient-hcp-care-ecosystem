#!/usr/bin/env bash
# Hook: PostToolUse — Quick lint check after file edits
# Runs TypeScript check on the edited file to catch immediate errors

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -oP '"file_path"\s*:\s*"([^"]+)"' | head -1 | sed 's/.*: *"//;s/"$//' | tr '\\' '/')

# Only lint .ts/.tsx files
if echo "$FILE_PATH" | grep -qE '\.(ts|tsx)$'; then
  # Quick syntax check — don't block, just warn
  if command -v npx &> /dev/null; then
    # Check if file has obvious syntax issues (fast, non-blocking)
    RESULT=$(npx tsc --noEmit --pretty false "$FILE_PATH" 2>&1 | head -5)
    if [ -n "$RESULT" ] && echo "$RESULT" | grep -q "error TS"; then
      ERROR_COUNT=$(echo "$RESULT" | grep -c "error TS")
      echo '{"continue": true, "systemMessage": "TypeScript: '"$ERROR_COUNT"' error(s) in '"$FILE_PATH"'. Run build to see details."}'
      exit 0
    fi
  fi
fi

echo '{"continue": true}'
exit 0
