# Genie Deck Comprehensive Audit Report
**Date:** 2026-01-20  
**Status:** In Progress

## Executive Summary

| Category | Status | Issues | Priority |
|----------|--------|--------|----------|
| Build Errors | ⚠️ | 1 stale diagnostic (EnhancedTemplateWorkflow) | Low |
| Edge Functions | ✅ | ai-universal-processor working | - |
| RLS Policies | ⚠️ | 67 linter warnings (permissive policies) | Medium |
| Database Schema | ✅ | All tables exist | - |
| Model Selection | ✅ | Dynamic via Universal AI Hub | - |
| Usage Tracking | ⚠️ | Tables exist, UI not wired | High |
| Output Types | ✅ | 8 types configured | - |

---

## 1. Build Errors

**Status:** ✅ Resolved
- The `EnhancedTemplateWorkflow` export was migrated to `wizardConstants.ts`
- All exports in `index.ts` are valid

---

## 2. Data Flow (Input → Generation)

### Step-by-Step Wizard Flow (6 Steps)
1. **Input** → Content source (prompt/document/URL/image)
2. **Configure** → Industry, segment, content type, AI Auto vs Custom mode
3. **Template & Branding** → Framework, theme, colors, logo
4. **Output Type** → 2D Static/Animated, 3D, Video, Interactive
5. **Agents & Languages** → Multi-language config, agent selection
6. **Generate** → Progress tracking, review actions

### AI Auto vs Custom Mode
- **AI Auto**: System recommends optimal providers based on context
  - Uses `getRecommendedProviders()` from `wizardConstants.ts`
  - Confidence scores displayed
- **Custom**: Manual provider selection via dropdowns
  - Text: Gemini, GPT-5, Claude, DeepSeek
  - Image: ModelsLab, Flux, DALL-E, Gemini Image
  - Voice: ElevenLabs, OpenAI, Google, Azure, AWS, Alibaba
  - Translation: DeepL, Google, Qwen-MT, Azure, NLLB

---

## 3. Model Selection (Dynamic, Not Hardcoded)

### Universal AI Hub Architecture
- **Location:** `src/services/ai-hub/UniversalAIHub.ts`
- **Edge Function:** `supabase/functions/ai-universal-processor/index.ts`

### Provider Registry
```typescript
// All providers dynamically loaded from:
// - src/services/ai-hub/providerRegistry.ts
// - src/services/ai-hub/configuredProviders.ts

// Fallback chain automatically applied
```

### Configured API Keys (34 secrets)
- OPENAI_API_KEY ✅
- ANTHROPIC_API_KEY ✅
- GEMINI_API_KEY ✅
- DEEPSEEK_API_KEY ✅
- MODELSLAB_API_KEY ✅
- ELEVENLABS_API_KEY ✅
- DEEPL_API_KEY ✅
- ALIBABA_API_KEY ✅

---

## 4. Output Types & Credit Burn Differences

| Output Type | Base Time/Slide | Credit Multiplier | Providers |
|-------------|-----------------|-------------------|-----------|
| 2D Static | 8s | 1x | ModelsLab, Flux, DALL-E |
| 2D Animated | 12s | 1.5x | Framer, Lottie |
| 3D Scene | 20s | 2x | Three.js, ModelsLab-3D |
| 3D Animated | 30s | 3x | Three.js + Physics |
| Video Intro | 25s | 2.5x | Runway, Pika Labs |
| Video Full | 30s | 4x | + ElevenLabs TTS |
| Interactive | 15s | 2x | React + Three.js |

---

## 5. Generation Limits & Caps

### Slide Limits
- **Maximum slides per generation:** 50
- **Chapter mode:** Max 10 chapters × 10 slides each

### Refresh/Regeneration Caps
- **Not currently capped** - needs implementation
- Recommendation: 3 regenerations per slide, 10 per presentation

### API Token Tracking
- **Tables exist:** `user_ai_credits`, `ai_credit_transactions`
- **UI NOT WIRED** - needs implementation

---

## 6. Missing Features (To Implement)

### High Priority
1. **Credit Usage Display** - Show tokens burned during generation
2. **Refresh Cap UI** - Display remaining refreshes
3. **Publish Flow** - Wire SocialPublisher to generated presentations

### Medium Priority
4. **Agent Creation UI** - Currently uses AGENT_CATALOG defaults
5. **Multi-model Comparison** - Phase 2 per governance docs
6. **Real-time Token Counter** - Show burn rate live

---

## 7. Database Tables (Verified)

| Table | Purpose | RLS |
|-------|---------|-----|
| presentations | Main presentation storage | ✅ |
| presentation_versions | Multi-language versions | ✅ |
| presentation_templates | User/system templates | ✅ |
| user_ai_credits | Credit balance | ✅ |
| ai_credit_transactions | Credit history | ✅ |
| api_usage_logs | API call tracking | ✅ |

---

## 8. RLS Security Warnings (67 Total)

- **5 Function Search Path Mutable** - Needs `SET search_path = public`
- **60+ RLS Policy Always True** - Review permissive policies

---

## 9. Action Items

### Immediate
- [ ] Wire `user_ai_credits` to UI for balance display
- [ ] Add credit burn tracking to generation flow
- [ ] Implement refresh cap counter

### Short-term
- [ ] Fix RLS permissive policies
- [ ] Add function search_path security
- [ ] Complete publish flow wiring

### Long-term (Per Governance)
- [ ] Phase 2: Multi-model comparison UI
- [ ] Phase 3A: User-scoped deployments
- [ ] Phase 4: Workspace multi-tenancy
