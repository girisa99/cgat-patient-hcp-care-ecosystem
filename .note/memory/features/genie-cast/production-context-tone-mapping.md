# Memory: features/genie-cast/production-context-tone-mapping
Updated: just now

## Production Context → Messaging Tone Mapping

### What Was Implemented
Added `PRODUCTION_CONTEXT_TONES` to `aiMessagingGeneratorService.ts` — a mapping of 6 production capabilities to distinct tone/style directives that automatically adapt messaging output.

### Production Capabilities
| Capability | Tone | Script Constraints |
|---|---|---|
| `avatar_lipsync` | Conversational, first-person, direct-to-camera | Max 15 words/sentence, monologue format |
| `3d_vr` | Immersive, spatial, second-person | Max 25 words/sentence, narration format |
| `ppt_slides` | Executive, bullet-friendly, data-heavy | Max 12 words/sentence, bullet format |
| `motion_graphics` | Punchy, rhythmic, action-verb heavy | Max 10 words/sentence, kinetic text |
| `stock_remix` | Narrative voiceover, cinematic | Max 20 words/sentence, voiceover format |
| `banner_static` | Ultra-concise headline + subline | Max 6 words/sentence, headline format |

### How It Works
1. User selects a production capability (from templates, asset labs, or video styles)
2. `productionCapability` is passed through `useAIMessaging` → `aiMessagingGeneratorService`
3. The tone directive is injected into the AI prompt alongside the creative angle
4. AI adapts ALL output (headlines, scripts, CTAs) to match the production format
5. Each variant gets tagged with its `productionCapability` for downstream use

### Integration Points
- **Templates**: Blueprint selection auto-sets `productionCapability` based on style
- **Asset Labs**: Asset type selection maps to capability
- **Video Styles**: `VideoStyleCards.tsx` style → capability mapping
- **Scene Scripts**: Variable injection uses tone-appropriate scripts

### Files Modified
- `src/services/marketing/aiMessagingGeneratorService.ts` — Added types, tones, prompt injection
- `src/hooks/useAIMessaging.ts` — Pass-through for `productionCapability`
