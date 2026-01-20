# Genie Deck Comprehensive Audit Report
**Date:** 2026-01-20  
**Status:** Complete Assessment  
**Version:** 2.0

---

## Executive Summary

| Category | Status | Issues | Priority | Action Required |
|----------|--------|--------|----------|-----------------|
| Build Errors | ✅ | None | - | - |
| Edge Functions | ✅ | ai-universal-processor working | - | - |
| RLS Policies | ⚠️ | 67 linter warnings | Medium | Fix permissive policies |
| Database Schema | ✅ | All tables exist | - | - |
| Model Selection | ✅ | Dynamic via Universal AI Hub | - | - |
| Credit Tracking | ✅ | UI Components Created | - | Wire to generation |
| Regeneration Caps | ✅ | Components Created | - | Wire to generation |
| Slide Count | ✅ | Dynamic 3-20 range | - | - |
| Output Types | ✅ | 8 types configured | - | - |
| Publish Flow | ⚠️ | SocialPublisher exists | Medium | Complete wiring |

---

## 1. Complete User Journey Flow

### 6-Step Wizard Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GENIE DECK WIZARD FLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STEP 1: INPUT                                                              │
│  ├── Source Type: Prompt | Document | URL | Image                           │
│  ├── Input Language Detection (auto or manual)                              │
│  └── Context: Target audience, objectives                                   │
│                                                                             │
│  STEP 2: CONFIGURE                                                          │
│  ├── Industry Selection (10 categories + subcategories)                     │
│  ├── Segment Selection (Enterprise, SMB, Startup, etc.)                     │
│  ├── Content Type (16 types: Storytelling, Investor Pitch, etc.)           │
│  └── AI Mode: Auto (recommended) | Custom (manual selection)               │
│                                                                             │
│  STEP 3: TEMPLATE & BRANDING                                                │
│  ├── Framework Templates (15 consulting frameworks)                         │
│  ├── Theme Selection (colors, fonts)                                        │
│  ├── Logo Upload & Positioning                                              │
│  └── Brand Color Extraction                                                 │
│                                                                             │
│  STEP 4: OUTPUT TYPE                                                        │
│  ├── Format: 2D Static | 2D Animated | 3D Scene | 3D Animated               │
│  │           Video Intro | Video Full | Interactive | Mixed                 │
│  ├── Structure: Flat | Chapters (max 10 chapters × 10 slides)              │
│  ├── Slide Count: 3-20 (dynamic recommendation by content type)            │
│  ├── Resolution & Aspect Ratio                                              │
│  └── Credit Burn Display (real-time cost estimate)                          │
│                                                                             │
│  STEP 5: AGENTS & LANGUAGES                                                 │
│  ├── Architecture: Single | Agentic AI | A2A                                │
│  ├── Agent Selection (from AGENT_CATALOG)                                   │
│  ├── Languages: Primary + Secondary (parallel generation)                  │
│  └── Voice/TTS Configuration (deferred to post-gen)                        │
│                                                                             │
│  STEP 6: GENERATE                                                           │
│  ├── Credit Balance Check                                                   │
│  ├── Refresh Caps Display                                                   │
│  ├── Progress Tracking (per-slide)                                          │
│  └── Real-time Streaming                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow Architecture

### Input → Processing → Output Pipeline

```
┌──────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   USER       │    │   WIZARD STATE   │    │   GENERATION    │
│   INPUT      │───▶│   MANAGEMENT     │───▶│   ENGINE        │
└──────────────┘    └──────────────────┘    └─────────────────┘
      │                      │                       │
      ▼                      ▼                       ▼
┌──────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ InputSource  │    │ workflowConfig   │    │ ai-universal-   │
│ - prompt     │    │ - collateralType │    │ processor       │
│ - document   │    │ - industry       │    │ Edge Function   │
│ - url        │    │ - segment        │    │                 │
│ - image      │    │ - aiModels       │    │ Providers:      │
└──────────────┘    │ - brandConfig    │    │ - OpenAI        │
                    │ - outputSettings │    │ - Claude        │
                    │ - languages[]    │    │ - Gemini        │
                    └──────────────────┘    │ - DeepSeek      │
                                            └─────────────────┘
                                                    │
                    ┌───────────────────────────────┘
                    ▼
┌───────────────────────────────────────────────────────────────┐
│                    GENERATION PIPELINE                        │
├───────────────────────────────────────────────────────────────┤
│  1. generationConfigService.buildPipelineConfig()             │
│     └── Converts UI settings to pipeline config               │
│                                                               │
│  2. outputAwareGenerationService.buildSlideRenderDecision()   │
│     └── Determines rendering strategy per output type         │
│                                                               │
│  3. For each slide:                                           │
│     ├── Generate content (text AI)                            │
│     ├── Generate image (image AI)                             │
│     ├── Apply content fitting                                 │
│     ├── Apply special rendering (3D/video/interactive)        │
│     └── Track credit consumption                              │
│                                                               │
│  4. Post-generation:                                          │
│     ├── Review actions available                              │
│     ├── Multi-language translation                            │
│     └── Export/Download/Publish                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. Model Selection (Dynamic, Not Hardcoded)

### Universal AI Hub Architecture

| Layer | Location | Purpose |
|-------|----------|---------|
| Service | `src/services/ai-hub/UniversalAIHub.ts` | Client-side orchestration |
| Registry | `src/services/ai-hub/providerRegistry.ts` | Provider definitions |
| Edge Function | `supabase/functions/ai-universal-processor/` | Server-side AI calls |

### Supported Providers & Models

```typescript
// From ai-universal-processor/index.ts
const UNIVERSAL_AI_REGISTRY = {
  llm: {
    openai: ['gpt-5-2025-08-07', 'gpt-4.1-2025-04-14', 'o3-2025-04-16', 'gpt-4o', 'gpt-4o-mini'],
    claude: ['claude-opus-4-1-20250805', 'claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022'],
    gemini: ['gemini-2.0-flash-exp', 'gemini-pro', 'gemini-1.5-pro', 'gemini-2.0-flash']
  },
  image: {
    gemini: ['google/gemini-2.5-flash-image-preview', 'google/gemini-3-pro-image-preview'],
    openai: ['dall-e-3', 'dall-e-2'],
    stability: ['stable-diffusion-xl', 'stable-diffusion-3']
  },
  vision: {
    openai: ['gpt-4o', 'o4-mini-2025-04-16'],
    claude: ['claude-3-5-sonnet-20241022'],
    gemini: ['gemini-1.5-pro-latest', 'gemini-2.0-flash-exp']
  }
};
```

### Configured API Keys (34 Secrets)

| Category | Keys Configured |
|----------|-----------------|
| **LLM** | OPENAI_API_KEY ✅, ANTHROPIC_API_KEY ✅, CLAUDE_API_KEY ✅, GEMINI_API_KEY ✅, DEEPSEEK_API_KEY ✅ |
| **Image** | MODELSLAB_API_KEY ✅, REPLICATE_API_TOKEN ✅ |
| **Voice** | ELEVENLABS_API_KEY ✅, GOOGLE_API_KEY ✅ |
| **Translation** | DEEPL_API_KEY ✅, MICROSOFT_TRANSLATE_API_KEY ✅, ALIBABA_API_KEY ✅ |
| **Other** | HUGGING_FACE_ACCESS_TOKEN ✅, ARIZE_API_KEY ✅, LANGWATCH_API_KEY ✅ |

### AI Auto vs Custom Mode

```typescript
// From wizardConstants.ts - getRecommendedProviders()
function getRecommendedProviders(industry: string, segment: string, contentType: string): AIProviderRecommendation {
  // Returns optimal provider configuration based on:
  // - Industry (healthcare → Claude for safety)
  // - Segment (enterprise → premium models)
  // - Content type (training → Gemini for multilingual)
  
  return {
    textModel: 'google/gemini-3-flash-preview',  // Dynamic based on context
    imageModel: 'modelslab',                      // Dynamic based on style needs
    voiceModel: 'elevenlabs-multilingual',        // Dynamic based on languages
    translationModel: 'deepl',                    // Dynamic based on regions
    confidence: 0.92,                             // Confidence score shown to user
    reason: 'Based on industry standards...'      // Explanation shown to user
  };
}
```

---

## 4. Output Types & Credit Burn Differences

### Output Type Configuration

| Output Type | Base Time/Slide | Credit Multiplier | Providers Used | Special Rendering |
|-------------|-----------------|-------------------|----------------|-------------------|
| 2D Static | 8s | 1.0x | Text + Image AI | PNG/WebP |
| 2D Animated | 12s | 1.5x | + Framer/Lottie | WebP + CSS animations |
| 3D Scene | 20s | 2.0x | + Three.js | WebGL static scene |
| 3D Animated | 30s | 3.0x | + Physics engine | WebGL + particle effects |
| Video Intro | 25s | 2.5x | + Runway/Pika | MP4 (5-10s per slide) |
| Video Full | 30s | 4.0x | + TTS/ElevenLabs | MP4 + voiceover |
| Interactive | 15s | 2.0x | + React components | SVG + click handlers |
| Mixed | varies | 2.0x avg | All of above | Hybrid output |

### Credit Burn Calculation

```typescript
// From CreditBurnDisplay.tsx
export const CREDIT_MULTIPLIERS: Record<OutputType, number> = {
  '2d-static': 1.0,
  '2d-animated': 1.5,
  '3d-scene': 2.0,
  '3d-animated': 3.0,
  'video-intro': 2.5,
  'video-full': 4.0,
  'interactive': 2.0,
  'mixed': 2.0,
};

// Example calculation:
// 10 slides × Video Full (4.0x) = 40 base credits
// + Multi-language (2 langs) = 40 × 1.5 = 60 credits
// + Premium voice = 60 + 5 = 65 credits total
```

---

## 5. Slide Count Recommendations

### Dynamic Slide Count by Content Type

```typescript
// From SlideCountRecommendation.tsx
export const SLIDE_RECOMMENDATIONS: Record<string, SlideRecommendation> = {
  'investor-pitch': {
    recommendedMin: 10,
    recommendedMax: 15,
    optimal: 12,
    reasoning: "Guy Kawasaki's 10/20/30 rule + flexibility",
    marketData: "Average Series A pitch: 12 slides"
  },
  'storytelling': {
    recommendedMin: 8,
    recommendedMax: 20,
    optimal: 15,
    reasoning: "Three-act structure + visual breaks",
    marketData: "TED-style narratives: 15-18 slides"
  },
  'training-module': {
    recommendedMin: 15,
    recommendedMax: 30,
    optimal: 20,
    reasoning: "Instructional design chunking principles",
    marketData: "Corporate training avg: 20-25 slides/hour"
  },
  'infographic-deck': {
    recommendedMin: 5,
    recommendedMax: 12,
    optimal: 8,
    reasoning: "Visual density limits attention",
    marketData: "Data viz best practices: 6-10 slides"
  },
  'whitepaper': {
    recommendedMin: 15,
    recommendedMax: 30,
    optimal: 25,
    reasoning: "In-depth coverage requires space",
    marketData: "B2B whitepapers: 20-30 slides"
  },
  // ... 11 more content types
};

// User can override: min 3, max 20 slides
// Adjustments based on output type (video = fewer slides)
```

---

## 6. Regeneration Caps & Refresh Limits

### Refresh Cap Configuration

```typescript
// From useRefreshCaps.ts
export const REFRESH_CAPS = {
  slide: {
    regenerate: 3,    // Full slide regeneration
    enhance: 5,       // AI enhancement
    fix: 10,          // Auto-fix issues
    analyze: 10,      // Quality analysis
  },
  presentation: {
    regenerate: 10,   // Full presentation regeneration
    enhance: 15,      // Bulk enhance
    autoFix: 20,      // Auto-fix all
    refresh: 5,       // Refresh suggestions
  },
};

// Tier adjustments
export const TIER_MULTIPLIERS = {
  free: 1.0,
  starter: 1.5,
  pro: 2.0,
  enterprise: 5.0,
};
```

### Refresh Cap UI Display

```
┌─────────────────────────────────────────────────┐
│ 🔄 Regeneration Limits                          │
├─────────────────────────────────────────────────┤
│ Slide Refreshes:     ████████░░ 8/10 remaining  │
│ Presentation Regens: ██████████ 3/3 remaining   │
│ Enhancement Calls:   ██████░░░░ 6/10 remaining  │
│                                                 │
│ Tier: Pro (2x multiplier applied)               │
└─────────────────────────────────────────────────┘
```

---

## 7. Database Schema (Verified)

### Core Tables

| Table | Purpose | RLS Status | Columns |
|-------|---------|------------|---------|
| `presentations` | Main presentation storage | ✅ Enabled | id, user_id, title, slides, config, created_at |
| `presentation_versions` | Multi-language versions | ✅ Enabled | id, presentation_id, language, slides |
| `presentation_templates` | User/system templates | ✅ Enabled | id, name, theme, layout, is_system |
| `user_ai_credits` | Credit balance | ✅ Enabled | user_id, balance, tier, updated_at |
| `ai_credit_transactions` | Credit history | ✅ Enabled | id, user_id, amount, feature, created_at |
| `ai_credit_packages` | Purchasable packages | ✅ Enabled | id, name, credits, price_cents |
| `ai_feature_costs` | Feature pricing | ✅ Enabled | feature_name, credits_per_unit, category |
| `api_usage_logs` | API call tracking | ✅ Enabled | id, user_id, endpoint, tokens, cost |

### Credit System Tables

```sql
-- user_ai_credits (balance tracking)
CREATE TABLE user_ai_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  balance INTEGER DEFAULT 100,
  tier VARCHAR DEFAULT 'free',
  lifetime_credits INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ai_credit_transactions (usage history)
CREATE TABLE ai_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  credits_amount INTEGER NOT NULL,
  transaction_type VARCHAR NOT NULL, -- 'usage' | 'purchase' | 'bonus'
  feature_used VARCHAR,
  feature_metadata JSONB,
  balance_after INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ai_feature_costs (pricing config)
CREATE TABLE ai_feature_costs (
  feature_name VARCHAR PRIMARY KEY,
  display_name VARCHAR NOT NULL,
  credits_per_unit INTEGER NOT NULL,
  unit_type VARCHAR DEFAULT 'request',
  category VARCHAR NOT NULL,
  tier_discounts JSONB
);
```

---

## 8. Edge Functions (Verified)

### Core Generation Functions

| Function | Purpose | Status | Dependencies |
|----------|---------|--------|--------------|
| `ai-universal-processor` | Main AI routing | ✅ Working | OpenAI, Claude, Gemini |
| `ai-image-generator` | Image generation | ✅ Working | ModelsLab, DALL-E |
| `ai-video-generator` | Video generation | ✅ Working | Runway, Pika Labs |
| `translation-service` | Multi-language | ✅ Working | DeepL, Google |
| `elevenlabs-voice` | TTS | ✅ Working | ElevenLabs |
| `use-ai-credits` | Credit deduction | ✅ Working | Supabase |
| `purchase-credits` | Credit purchase | ✅ Working | Stripe |

### Edge Function Actions (ai-universal-processor)

```typescript
// Supported actions:
const SUPPORTED_ACTIONS = [
  'health_check',           // Verify function is running
  'list_models',            // Return available models
  'translate',              // Multi-language translation
  'tts',                    // Text-to-speech
  'stt',                    // Speech-to-text
  'nlp',                    // Entity extraction, sentiment
  'image_generation',       // Generate images
  'analyze_scene',          // Vision analysis
  'enhance-content',        // AI content enhancement
  'analyze-content',        // Quality analysis
  'fix-content',            // Auto-fix issues
  'refresh-suggestions',    // New suggestions
  'regenerate-content',     // Full regeneration
];
```

---

## 9. Post-Generation Review Actions

### Available Actions

| Action | Scope | Description | AI Required |
|--------|-------|-------------|-------------|
| `accept` | Element/Slide/Chapter/Presentation | Accept as final | No |
| `skip` | Element/Slide | Skip with reason | No |
| `enhance` | Element/Slide | AI polish/improve | Yes |
| `analyze` | Slide/Presentation | Quality analysis | Yes |
| `fix` | Element/Slide | Auto-fix issues | Yes |
| `refresh` | Slide/Presentation | Get new suggestions | Yes |
| `revert` | Element/Slide | Revert to original | No |
| `regenerate` | Slide/Presentation | Full regeneration | Yes |

### Review Action Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REVIEW ACTIONS FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Generated Slide                                            │
│       │                                                     │
│       ├──▶ [Analyze] ──▶ Quality Score + Issues             │
│       │                        │                            │
│       │                        ▼                            │
│       │               ┌─────────────────┐                   │
│       │               │ Issues Found?   │                   │
│       │               └────────┬────────┘                   │
│       │                   Yes  │  No                        │
│       │                        │                            │
│       │                        ▼                            │
│       ├──▶ [Fix] ◀─────── Auto-fix Available                │
│       │       │                                             │
│       │       ▼                                             │
│       ├──▶ [Enhance] ──▶ Polish/Improve Content             │
│       │                                                     │
│       ├──▶ [Refresh] ──▶ Get New Suggestions                │
│       │                                                     │
│       ├──▶ [Accept] ──▶ Mark as Final ──▶ Next Slide       │
│       │                                                     │
│       ├──▶ [Skip] ──▶ Skip with Reason ──▶ Next Slide      │
│       │                                                     │
│       └──▶ [Regenerate] ──▶ Full Re-generation              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Publish Flow

### Current Status: ⚠️ Partial Implementation

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLISH FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Generated Presentation                                     │
│       │                                                     │
│       ├──▶ [Download] ──▶ PPTX / PDF / Images ──▶ ✅ Working│
│       │                                                     │
│       ├──▶ [Save to RAG] ──▶ Knowledge Base ──▶ ✅ Working  │
│       │                                                     │
│       ├──▶ [Share Link] ──▶ Shareable URL ──▶ ⚠️ Partial   │
│       │                                                     │
│       └──▶ [Publish Social] ──▶ LinkedIn/YouTube            │
│                                       │                     │
│                                       ▼                     │
│                              SocialPublisher.tsx            │
│                              (Component exists)             │
│                                       │                     │
│                                       ▼                     │
│                              ⚠️ Not fully wired to          │
│                                 generated output            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Publish Endpoints

| Platform | Edge Function | Status |
|----------|---------------|--------|
| LinkedIn | `social-publish` | ⚠️ Exists, needs wiring |
| YouTube | `social-publish` | ⚠️ Exists, needs wiring |
| SlideShare | - | ❌ Not implemented |
| Direct Link | `share-presentation` | ✅ Working |

---

## 11. Security Assessment (67 Warnings)

### Issue Breakdown

| Issue Type | Count | Severity | Action |
|------------|-------|----------|--------|
| Function Search Path Mutable | 5 | WARN | Add `SET search_path = public` |
| Extension in Public | 1 | WARN | Move extensions to separate schema |
| RLS Policy Always True | 61 | WARN | Review and restrict policies |

### Critical RLS Issues

```sql
-- Tables with overly permissive policies (USING (true)):
-- These need to be reviewed and restricted to auth.uid() checks

-- Example fix pattern:
-- Before: USING (true)
-- After: USING (auth.uid() = user_id)

ALTER POLICY "policy_name" ON table_name
  USING (auth.uid() = user_id);
```

---

## 12. Component Architecture

### Wizard Components

```
src/components/genie-studio/presentation-generator/
├── PresentationWizard.tsx          # Main wizard container
├── ConfigurationPanel.tsx          # Step 2: Industry/Segment
├── TemplateBrandingPanelV2.tsx     # Step 3: Template/Branding
├── OutputTypePanel.tsx             # Step 4: Output selection
├── AgentLanguageConfigPanel.tsx    # Step 5: Agents/Languages
├── GenerationProgressPanel.tsx     # Step 6: Progress tracking
│
├── components/
│   ├── CreditBurnDisplay.tsx       # Credit estimation UI
│   ├── RefreshCapsDisplay.tsx      # Refresh limits UI
│   └── SlideCountRecommendation.tsx # Dynamic slide suggestions
│
├── services/
│   ├── outputAwareGenerationService.ts  # Rendering decisions
│   ├── reviewActionService.ts           # Post-gen actions
│   └── templateRecommendationService.ts # Template suggestions
│
├── hooks/
│   └── useReviewActions.ts         # Review action hook
│
├── types/
│   └── reviewActions.ts            # Review action types
│
├── wizardConstants.ts              # Collateral types, industries
└── types.ts                        # Core type definitions
```

### Hook Architecture

```
src/hooks/
├── useAICredits.ts                 # Credit management
├── useRefreshCaps.ts               # Regeneration limits
├── useUniversalPresentation.ts     # Generation orchestration
├── usePresentationSession.ts       # Session persistence
├── useAgentPresentationGenerator.ts # Agent-based generation
└── useUsageTracking.ts             # Usage analytics
```

---

## 13. Action Items

### High Priority (Immediate)

- [x] Create CreditBurnDisplay component
- [x] Create RefreshCapsDisplay component
- [x] Create SlideCountRecommendation component
- [x] Wire components into wizard UI
- [ ] Complete credit deduction during generation
- [ ] Wire refresh cap enforcement

### Medium Priority (Short-term)

- [ ] Fix 5 function search_path warnings
- [ ] Review 61 permissive RLS policies
- [ ] Complete SocialPublisher wiring
- [ ] Add real-time token counter during generation

### Low Priority (Long-term - Per Governance)

- [ ] Phase 2: Multi-model comparison UI
- [ ] Phase 3A: User-scoped deployments
- [ ] Phase 4: Workspace multi-tenancy

---

## 14. Verification Checklist

### ✅ Verified Working

- [x] 6-step wizard navigation
- [x] Industry/segment selection
- [x] Content type selection (16 types)
- [x] Template/branding customization
- [x] Output type selection (8 types)
- [x] Dynamic model selection (no hardcoding)
- [x] Multi-language configuration
- [x] Agent architecture options
- [x] Edge function routing
- [x] Credit tracking tables exist
- [x] Slide count recommendations
- [x] Credit burn display component
- [x] Refresh caps display component

### ⚠️ Needs Wiring

- [ ] Credit deduction during generation
- [ ] Refresh cap enforcement
- [ ] Real-time credit burn updates
- [ ] Social publish integration

### ❌ Not Implemented

- [ ] SlideShare publishing
- [ ] Export to Google Slides
- [ ] Collaborative editing

---

**Last Updated:** 2026-01-20  
**Auditor:** Genie AI System  
**Next Review:** After credit wiring completion
