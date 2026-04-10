---
name: region-audit
description: Audit regional routing coverage and find gaps across all 16 regions
argument-hint: "[capability or 'all']"
allowed-tools: "Read Grep Glob Bash(npm run build:*)"
---

# Regional Routing Audit

Audit routing coverage for: `$ARGUMENTS`

## What to Check

### 1. DB Coverage
Query `ai_model_regional_routing` for the specified capability (or all capabilities).
Verify all 16 parent regions have routing: NAM, EU, EURASIA, TURKEY, MENA, AFRICA, INDIA, PAKISTAN, BANGLADESH, SOUTH_ASIA, SEA, CJK, LATAM, CARIBBEAN, OCEANIA, CENTRAL_ASIA.

### 2. Fallback Chains
Every region MUST have:
- A `primary_model_id` that is `status='active'` in `ai_model_registry`
- At least 1 `fallback_model_ids` entry
- The fallback model must also be active

### 3. Code-Level Routing
Check these files use dynamic routing (not hardcoded):
- `src/services/llmRoutingStrategy.ts`
- `src/services/unifiedProviderRoutingAdapter.ts`
- `src/config/regional-routing-registry.ts`
- `src/services/unifiedRoutingLogic.ts`

### 4. Report Format
```
Region     | Capability | Primary         | Fallbacks       | Status
-----------|-----------|-----------------|-----------------|--------
NAM        | llm       | claude-sonnet-4-6| [gpt-4o, ...]  | OK
MENA       | tts       | cosyvoice-v3    | [elevenlabs]    | OK
AFRICA     | image-gen | ???             | ???             | MISSING
```

Flag any region with no routing, inactive primary models, or missing fallbacks.
