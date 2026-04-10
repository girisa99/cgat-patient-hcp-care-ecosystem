---
name: model-guard
description: Auto-detects hardcoded or retired AI model IDs when editing AI-related files
user-invocable: false
paths:
  - "src/services/**/*.ts"
  - "src/hooks/**/*.ts"
  - "src/config/**/*.ts"
  - "src/components/**/ai*.ts"
  - "src/components/**/ai*.tsx"
  - "src/components/**/AI*.ts"
  - "src/components/**/AI*.tsx"
  - "supabase/functions/**/*.ts"
---

# Model Guard — Auto-Detection Skill

When Claude edits any AI-related file, automatically check:

## Detection Rules
1. **Retired model strings** — Any model ID that exists in `ai_model_registry` with `status` in ('retired', 'sunset', 'deprecated') should NOT appear as a hardcoded string in new code
2. **Direct model ID usage** — New code should use `resolveModelId()` (client) or `resolveModel()` (edge) instead of raw model ID strings
3. **Missing resolver imports** — If a file uses model IDs but doesn't import from `provider-version-registry` or `dynamic-model-resolver`, suggest adding the import

## Exception Patterns (do NOT flag)
- Alias map definitions (keys that map old → new)
- Test files testing resolution
- Migration SQL seed data
- Comments and documentation
- Logger/console.log strings

## When Detected
- Emit a warning message explaining which model ID is outdated
- Suggest the current replacement from the registry
- Suggest using `resolveModelId('old-id')` which auto-resolves

## Reference
- Client resolver: `import { resolveModelId } from '@/config/provider-version-registry'`
- Edge resolver: `import { resolveModel } from '../_shared/dynamic-model-resolver.ts'`
- React hook: `import { useModelRegistry } from '@/hooks/useModelRegistry'`
