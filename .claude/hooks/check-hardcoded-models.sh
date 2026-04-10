#!/usr/bin/env bash
# Hook: PreToolUse — Warn when writing retired/hardcoded model IDs
# Checks new_string / content for known retired model patterns
# Exit 0 with warning = allow but alert, Exit 2 = block

INPUT=$(cat)

# Extract the content being written (new_string for Edit, content for Write)
CONTENT=$(echo "$INPUT" | grep -oP '"(?:new_string|content)"\s*:\s*"([^"]*(?:\\.[^"]*)*)"' | head -1)

# Retired model patterns that should NEVER appear in new code
# This list is intentionally dynamic — add patterns as models retire
RETIRED_PATTERNS=(
  "claude-3-5-sonnet"
  "claude-3-5-haiku"
  "claude-3.5-sonnet"
  "claude-3.5-haiku"
  "claude-opus-4-5"
  "claude-sonnet-4-5"
  "claude-sonnet-4-20250514"
  "claude-3-7-sonnet"
  "claude-3-haiku"
  "dall-e-3"
  "dall-e-2"
  "gemini-1.5-pro"
  "gemini-1.5-flash"
  "gemini-pro"
)

# Exception: resolver/alias map files that SHOULD contain old IDs as mapping keys
FILE_PATH=$(echo "$INPUT" | grep -oP '"file_path"\s*:\s*"([^"]+)"' | head -1 | sed 's/.*: *"//;s/"$//' | tr '\\' '/')
EXCEPTION_PATTERNS=(
  "dynamic-model-resolver"
  "provider-version-registry"
  "model-registry-test"
  "migrations/"
)

for exception in "${EXCEPTION_PATTERNS[@]}"; do
  if echo "$FILE_PATH" | grep -q "$exception"; then
    echo '{"continue": true}'
    exit 0
  fi
done

# Check content for retired patterns
for pattern in "${RETIRED_PATTERNS[@]}"; do
  if echo "$CONTENT" | grep -qi "$pattern"; then
    echo '{"continue": true, "systemMessage": "WARNING: Detected retired model ID '"'$pattern'"' in new code. Use resolveModelId() or the dynamic model registry instead. See CLAUDE.md."}'
    exit 0
  fi
done

echo '{"continue": true}'
exit 0
