# Memory: features/localization/india-per-language-expansion-v1
Updated: just now

## India Per-Language 3-Level Expansion

India now supports 3-level nesting: INDIA → Sub-Region → Language. Each language gets its own fully transcreated script AND dedicated TTS voice with native locale.

### India Language Breakdown (12 scripts from 1 English base)

| Sub-Region | Languages | Voice Locales |
|---|---|---|
| **INDIA_NORTH** → INDIA_NORTH_HI, INDIA_NORTH_UR, INDIA_NORTH_PA | Hindi, Urdu, Punjabi (3) | hi-IN, ur-IN, pa-IN |
| **INDIA_SOUTH** → INDIA_SOUTH_TA, INDIA_SOUTH_TE, INDIA_SOUTH_KN, INDIA_SOUTH_ML | Tamil, Telugu, Kannada, Malayalam (4) | ta-IN, te-IN, kn-IN, ml-IN |
| **INDIA_WEST** → INDIA_WEST_MR, INDIA_WEST_GU | Marathi, Gujarati (2) | mr-IN, gu-IN |
| **INDIA_EAST** → INDIA_EAST_BN, INDIA_EAST_OR | Bengali, Odia (2) | bn-IN, or-IN |
| **INDIA_PAN** → INDIA_PAN_EN | Indian English (1) | en-IN |

### Changes Made
- `REGION_HIERARCHY` India group uses 3-level nesting (children with children)
- `voiceOptionsMap` has 12 new language-level voice entries with 2 voices each (male + female)
- Language maps updated in both `handleAutoExpandAndTranscreate` and `handleExpandSubRegions`
- `subRegionFallbackOrder` includes all 12 new language codes
- DB `valid_region` CHECK constraint updated with all 12 new codes
- All sub-regions use Gemini 3 Pro as primary LLM (strongest Indic language support)

### Key Difference from EU Expansion
- EU: Per-country (same language, different dialect) → light tone adaptation
- India: Per-language (completely different scripts & phonetics) → full transcreation required

### Global Total: 60 leaf-level scripts + 1 English base = 61

Last Updated: 2026-02-12
