---
name: model-update
description: Register, deprecate, or retire an AI model in the dynamic registry
argument-hint: "[action] [model-id] [options]"
allowed-tools: "Read Grep Glob Edit Bash(npm run build:*)"
---

# Model Registry Update

Perform a model registry operation: `$ARGUMENTS`

## Actions
- **register [model-id]** — Add a new model to the ecosystem
- **deprecate [old-model] [new-model]** — Mark model deprecated with replacement
- **retire [model-id]** — Remove model from active use
- **audit** — Scan codebase for any hardcoded/retired model strings
- **status** — Show current registry health

## Rules
1. ALL model changes go through the DB table `ai_model_registry` — never edit code
2. When deprecating: set `replaced_by` and add old ID to new model's `model_alias[]`
3. When registering: include `capabilities[]`, `provider`, `quality_tier`, `speed_tier`
4. After any change: verify the resolver picks it up via `resolveModelId()` test
5. Run full build to confirm zero breakage

## Key Files
- DB migration: `supabase/migrations/20260409030000_ai_model_registry.sql`
- Edge resolver: `supabase/functions/_shared/dynamic-model-resolver.ts`
- Client resolver: `src/config/provider-version-registry.ts`
- Admin API: `supabase/functions/ai-model-admin/index.ts`
- Test suite: `src/tests/model-registry-test.ts`

## Audit Pattern
When auditing, search for retired model patterns across `*.ts` and `*.tsx` files.
Exclude: resolver alias maps, test files, migration files, and comments.
Report findings grouped by file with suggested replacements.
