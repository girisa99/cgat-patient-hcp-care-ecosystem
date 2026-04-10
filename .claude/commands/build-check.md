---
name: build-check
description: Run full build with memory allocation and report results
allowed-tools: "Bash(npm run build:*) Bash(NODE_OPTIONS:*) Read"
---

# Build Check

Run the full production build and report status:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npm run build
```

## On Success
- Report build time and any warnings (chunk size, etc.)
- Note any new chunks that appeared or significantly changed size

## On Failure
- Read the error output carefully
- Identify the failing file(s) and line numbers
- Suggest fixes based on the error type (TS errors, import issues, etc.)
- Do NOT auto-fix without user approval — just report

## Important
- Never use plain `npm run build` — it will OOM on this codebase
- The `NODE_OPTIONS` flag is required for every build
