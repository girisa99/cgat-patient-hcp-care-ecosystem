---
name: build-validate
description: Auto-suggests build validation after significant code changes across multiple files
user-invocable: false
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "supabase/functions/**/*.ts"
---

# Build Validate — Auto-Suggestion Skill

After Claude edits 3+ files in a session, automatically suggest running the build:

## Trigger Conditions
- 3 or more files edited in the current session
- Any edit to shared infrastructure (services, config, hooks)
- Any edit to edge functions
- Any rename or restructure operation

## Action
Suggest (don't auto-run):
```bash
NODE_OPTIONS="--max-old-space-size=8192" npm run build
```

## Why
- This codebase is large (900+ files, 9MB+ bundle)
- TypeScript errors can cascade across files
- Edge function Deno imports have different resolution than Vite
- A passing build is the baseline quality gate
