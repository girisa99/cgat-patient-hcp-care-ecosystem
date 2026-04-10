#!/usr/bin/env bash
# Hook: PreToolUse — Block edits to locked infrastructure files
# Reads tool input from stdin, checks if target file is in the locked list
# Exit 2 = block, Exit 0 = allow

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -oP '"file_path"\s*:\s*"([^"]+)"' | head -1 | sed 's/.*: *"//;s/"$//')

# Normalize path separators
FILE_PATH=$(echo "$FILE_PATH" | tr '\\' '/')

# Dynamic locked file patterns — add new patterns here, not in code
LOCKED_PATTERNS=(
  "src/constants/genie-products.ts"
  "src/hooks/useMasterAuth.tsx"
  "src/components/auth/ProtectedRoute.tsx"
  "src/components/auth/GenieStudioProtectedRoute.tsx"
  "src/components/layout/AppLayout.tsx"
  "src/components/layout/GenieStudioLayout.tsx"
  "src/integrations/supabase/"
  "src/config/genieStudioNavItems.ts"
)

for pattern in "${LOCKED_PATTERNS[@]}"; do
  if echo "$FILE_PATH" | grep -q "$pattern"; then
    echo '{"continue": false, "stopReason": "BLOCKED: '"$FILE_PATH"' is a locked infrastructure file. See CLAUDE.md for the locked files list."}'
    exit 2
  fi
done

echo '{"continue": true}'
exit 0
