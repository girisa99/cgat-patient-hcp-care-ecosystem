---
name: region-check
description: Auto-validates regional coverage when routing or provider files are modified
user-invocable: false
paths:
  - "src/services/*routing*.ts"
  - "src/services/*Routing*.ts"
  - "src/config/regional*.ts"
  - "src/services/unifiedRoutingLogic.ts"
  - "supabase/functions/intent-analyzer/**"
---

# Region Check — Auto-Validation Skill

When Claude modifies any routing or regional configuration file, automatically verify:

## Checks
1. **All 16 regions covered** — NAM, EU, EURASIA, TURKEY, MENA, AFRICA, INDIA, PAKISTAN, BANGLADESH, SOUTH_ASIA, SEA, CJK, LATAM, CARIBBEAN, OCEANIA, CENTRAL_ASIA
2. **No region left with undefined/null provider** — Every region must resolve to a valid provider
3. **4-zone consistency** — Claude Zone (Western), Alibaba Zone (CJK/MENA/Central Asia), Gemini Zone (India/SEA/Africa), Fallback Zone (GPT-4o)
4. **Fallback chains exist** — No region should have only one provider with zero fallbacks
5. **Model IDs are current** — All referenced models should be `status='active'` in the registry

## When Issues Found
- List which regions are affected
- Show what's missing or inconsistent
- Suggest the correct routing based on the 4-zone architecture
- Reference `ai_model_regional_routing` table for the authoritative source
