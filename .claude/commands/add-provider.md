---
name: add-provider
description: Add a new AI provider or model to the ecosystem end-to-end
argument-hint: "[provider-name] [model-id]"
allowed-tools: "Read Grep Glob Edit Write Bash(npm run build:*)"
---

# Add New AI Provider/Model

Add `$ARGUMENTS` to the GenieSuite ecosystem.

## Steps (in order)

### 1. Database Registration
Prepare SQL INSERT for `ai_model_registry`:
- `model_id`, `display_name`, `provider`
- `capabilities[]` — what it can do (llm, vision, text-to-image, text-to-video, tts, stt, etc.)
- `model_alias[]` — alternative names it's known by
- `quality_tier` (basic/standard/advanced/premium)
- `speed_tier` (fast/medium/slow)
- `status` = 'active'

### 2. Edge Function Support
Check if `ai-universal-processor` already routes to this provider.
If not, add a new provider handler following the existing pattern:
- API key from `Deno.env.get()`
- Request/response normalization
- Error handling with provider-specific codes

### 3. Regional Routing (if applicable)
Determine which regions this model should serve:
- Check `ai_model_regional_routing` for gaps
- UPSERT routing entries for relevant region+capability combinations

### 4. Client Registry Sync
The client auto-loads from DB via `initializeFromDB()`. No code change needed.
Verify by checking that `getActiveModel(provider, capability)` returns the new model.

### 5. Hardcoded Fallback (optional)
If this is a primary provider, add to `FALLBACK_MODELS` in `dynamic-model-resolver.ts`
and `ACTIVE_MODELS` in `model-versions.ts` as emergency fallback.

### 6. Verify
- Run build: `NODE_OPTIONS="--max-old-space-size=8192" npm run build`
- Run test: check `model-registry-test.ts` patterns
