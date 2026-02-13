# P0 Foundation: Content Pool + Intent Router Architecture

> **Status:** P0 Foundation - In Development  
> **Last Updated:** 2026-02-13  
> **Version:** 1.0.0  
> **Scope:** Dual-Mode (Internal Genie + External Subscriber) Ready

---

## Overview

This document maps the **P0 Foundation** — the unified content system that powers CREATE → PRODUCE → PUBLISH for both:

1. **Internal Mode:** Marketing the 8 Genie products (Spark, Mind, Vibe, Deck, Hub, Cast, Ask Genie, Suite)
2. **External Mode:** Enabling subscribers to generate marketing for their own products

The foundation consists of:
- **useContentPool** hook: Unified data source for all products, audiences, scripts, TTS
- **intent-analyzer** edge function: Intelligent intent classification with multi-modal support
- **Content Pool**: Database-driven registry enabling multi-tenancy via RLS

---

## Architecture Flow

```
User Intent
    ↓
intent-analyzer (Edge Function)
    ├── Classifies output type (Video, PPT, Avatar, 3D, Combination)
    ├── Detects capabilities (lipsync, TTS, animation, 3D, AR/VR)
    ├── Maps style intent → provider chains
    └── Suggests templates + scoring
    ↓
useContentPool Hook (React)
    ├── Fetches products (Genie or subscriber)
    ├── Loads brand assets
    ├── Pulls regional scripts (transcreated)
    ├── Retrieves TTS audio versions
    └── Aggregates messaging/audiences
    ↓
CREATE Wizard
    ├── Select product → load context
    ├── Select template → auto-filter by capabilities
    ├── Generate content → use pool data
    └── Advance to PRODUCE
    ↓
PRODUCE (Pipelines + Asset Lab)
    ├── Execute multi-modal orchestration
    ├── Generate derivatives (thumbnails, banners, OG)
    └── Prepare for publish
    ↓
PUBLISH
    └── Schedule across channels
```

---

## Database Schema (Multi-Tenant Ready)

### Core Tables

| Table | Purpose | Multi-Tenant | Key Fields |
|-------|---------|---|---|
| `marketing_products` | Product metadata | ✅ RLS + `is_system_default` | `id`, `created_by`, `is_system_default`, `name`, `categories`, `features` |
| `marketing_brand_assets` | Logo, colors, fonts | ✅ RLS | `id`, `created_by`, `is_system_default`, `primary_color`, `logo_url` |
| `marketing_audiences` | Personas, frameworks | ✅ RLS | `id`, `created_by`, `persona_name`, `preferred_framework`, `industry` |
| `marketing_languages` | Supported languages | ✅ Shared reference | `language_code`, `language_name`, `region_codes` |
| `video_blueprints` | Template definitions | ✅ `is_public` + `created_by` | `id`, `name`, `style_preset` (JSON w/ multimodal flags) |
| `regional_narration_scripts` | Transcreated scripts | ✅ Via `product_id` FK | `id`, `product_id`, `region_code`, `content`, `llm_provider`, `routing_zone` |
| `tts_audio_versions` | Pre-generated audio | ✅ Via `script_id` FK | `id`, `script_id`, `language_code`, `voice_id`, `audio_url`, `provider` |
| `video_style_registry` | 67 styles × provider chains | ✅ Shared | `style_intent`, `image_providers[]`, `video_providers[]`, `avatar_providers[]`, `3d_providers[]` |
| `content_intents` | User-created or system intents | ✅ RLS | `id`, `intent_key`, `label`, `created_by`, `is_system_default` |

---

## Component Breakdown

### 1. useContentPool Hook (`src/hooks/useContentPool.ts`)

**Purpose:** Single aggregation point for all product, brand, audience, script, and TTS data.

```typescript
const pool = useContentPool();

pool.products           // All products (Genie + subscriber)
pool.brandAssets        // Primary brand (highest priority)
pool.audiences          // Personas with frameworks
pool.regionalScripts    // Active scripts per product/region
pool.ttsAudio          // Pre-generated audio files

// Helpers
pool.getProductById(id)
pool.getScriptsForProduct(productId)
pool.getScriptForRegion(productId, regionCode)
pool.getTTSForScript(scriptId)
pool.getAudienceByFramework(framework)
```

**Data Flow:**
1. On mount: Fetch current user ID
2. Query: `marketing_products` (system + user's)
3. Query: `marketing_brand_assets` (system + user's, prioritize system)
4. Query: `marketing_audiences` (system + user's)
5. Query: `regional_narration_scripts` (active only)
6. Query: `tts_audio_versions` (all)
7. Return: Unified `ContentPoolContext` + helper functions
8. Cache: 10 minutes (React Query)

**Multi-Tenant Support:**
- RLS policies filter by `created_by` or `is_system_default`
- System defaults always available to all users
- Subscriber data isolated by user ID

### 2. intent-analyzer Edge Function (`supabase/functions/intent-analyzer`)

**Purpose:** Agentic classification of user intent into actionable production specs.

**Input:**
```typescript
{
  natural_language_intent?: string;      // "PPT with avatar explaining 3D product"
  output_type?: 'video' | 'ppt' | 'avatar' | '3d' | 'combination';
  target_industry?: string;               // "healthcare", "fintech"
  target_region?: string;                 // "MENA", "LATAM", "INDIA"
  target_audiences?: string[];            // ["CFO", "Developer"]
  multi_modal_types?: string[];           // ["infographic", "3d_avatar"]
}
```

**Output:**
```typescript
{
  detected_output_type: string;            // Resolved type
  detected_combination: string[] | null;   // ["avatar", "3d", "video"]
  capability_requirements: {               // AI capabilities needed
    lipsync: boolean;
    tts: boolean;
    animation: boolean;
    '3d': boolean;
    video: boolean;
    ar_vr: boolean;
  },
  style_intent: string;                    // e.g., "healthcare-professional"
  provider_chains: {                       // From video_style_registry
    image_provider: string[];
    video_provider: string[];
    avatar_provider: string[];
    '3d_provider': string[];
    tts_provider: string[];
  },
  target_frameworks: string[];             // ["AIDA", "JTBD"]
  suggested_templates: Array<{
    template_id: string;
    match_score: number;                   // 0-100
    reasoning: string;
  }>,
  confidence_score: number;                // 0.0-1.0
  recommended_region_llm: string;          // 'claude' | 'qwen' | 'gemini' | 'gpt-4o'
}
```

**Logic:**
1. **NL Parsing:** Detect output type keywords (ppt, avatar, 3d, etc.)
2. **Combination Detection:** Identify multi-modal modifiers
3. **Capability Mapping:** Translate to required AI services
4. **Style Intent Lookup:** Query `video_style_registry` for matching styles
5. **Provider Chain Retrieval:** Return multi-modal provider chains
6. **Framework Suggestion:** Match industry → frameworks (healthcare → JTBD, finance → AIDA)
7. **Template Scoring:** Recommend top 3 templates with confidence

**Region-Aware LLM Routing** (for future script generation):
- Western/EU/NAM → Claude
- MENA/CJK → Qwen
- India/SEA/Africa → Gemini
- Pakistan/EE/Caribbean → GPT-4o

### 3. Content Pool Registry (Database Driven)

**System Defaults (Internal Mode):**
- 8 Genie products pre-loaded with `is_system_default = true`
- Brand assets (Genie logos, colors, fonts)
- 20-segment audience matrix
- 50+ system intent definitions

**Subscriber Setup (External Mode):**
- User onboards: add products → brand → audiences → regions
- Stored with `created_by = user_id`
- RLS prevents cross-user data access
- System defaults always visible alongside subscriber data

---

## Workflow: From Intent to Output

### Example 1: Internal (Genie Cast Marketing)

```
USER: "Create a product demo video for Vibe targeting Indian creators"

1. INTENT ANALYZER:
   → Detects: video, Indian region, creator audience
   → Style: "product_demo" 
   → Providers: Vertex Veo 3, Azure TTS, Gemini routing
   → Frameworks: ["AIDA", "StoryBrand"]
   → Templates: [Vibe Product Demo, Generic Explainer, ...]

2. CREATE WIZARD:
   → Product: Vibe (from pool.products)
   → Region: INDIA_NORTH (from pool.regionalScripts)
   → Audience: Creator (from pool.audiences)
   → Script: Hindi transcreation (from pool.getScriptForRegion)
   → TTS: Female voice, Hindi (from pool.getTTSForScript)

3. PRODUCE:
   → Generate video using Veo 3 + Azure TTS
   → Asset Lab: Create thumbnails, hero banner, OG image
   → All content unified via content pool

4. PUBLISH:
   → Schedule to YouTube, Instagram, LinkedIn (creator platforms)
```

### Example 2: External (Subscriber SaaS)

```
USER: "I'm Acme Healthcare. Create training PPT with avatar for Saudi Arabia"

1. ONBOARDING:
   → Add Product: "SafeMeds"
   → Brand: Acme logo, colors, compliance rules
   → Audience: "Healthcare Admin", "Nurse"
   → Regions: ["MENA_SA"]

2. INTENT ANALYZER:
   → Detects: PPT + avatar combination, healthcare, MENA region
   → Providers: Azure TTS (Arabic), Wan 2.2 (avatar)
   → Frameworks: ["JTBD", "StoryBrand"]

3. CREATE:
   → Product: SafeMeds (from their pool)
   → Script: Generated with Qwen (MENA provider)
   → TTS: Arabic voice, female
   → Template: "Healthcare Training with Avatar"

4. PRODUCE:
   → Generate: 12-slide PPT + avatar narration × 2 languages
   → Asset Lab: Training thumbnails, course banner, certificate template
   → All branded with Acme assets

5. PUBLISH:
   → Distribute to LMS, internal training portal
```

---

## Tier Gating Integration

| Tier | Products | Regions | Languages | Templates | Asset Types | Pipelines | TTS Providers |
|---|---|---|---|---|---|---|---|
| Creator | 1 | 1 | 3 | Public only | 5 basic | Video, PPT | Azure |
| Pro | 3 | 3 parent | 10 | + 5 custom | 12 | + Avatar, 3D | + Google, EL |
| Business | 10 | All parent | 30 | + 50 custom | All 20 | All 206 | All 7 |
| Enterprise | Unlimited | All + sub | All 50+ | Unlimited | Custom | All + workflow | All |

**Implementation in Pool:**
```typescript
const filteredProducts = pool.products.filter(p => 
  userTier.productLimit >= pool.products.length
);

const availableLanguages = pool.audiences.filter(a =>
  userTier.languageLimit >= selectedAudiences.length
);
```

---

## Multi-Modal Support Matrix

### Templates (434+ library)

| Category | Video | PPT | Avatar | 3D | Combination | Available Via |
|---|---|---|---|---|---|---|
| Product Demo | ✅ | ✅ | ✅ | ✅ | Avatar + 3D | Blueprint + style_preset |
| Training | ✅ | ✅ | ✅ | ❌ | Avatar + PPT | Blueprint + style_preset |
| Testimonial | ✅ | ❌ | ✅ | ❌ | Avatar only | Blueprint + style_preset |
| Explainer | ✅ | ✅ | ✅ | ✅ | All combos | Blueprint + style_preset |
| Pitch Deck | ❌ | ✅ | ✅ | ✅ | Avatar + 3D | Blueprint + style_preset |

### Pipelines (206 total)

Core categories:
- Video Pipelines: 45 (talking head, product, explainer, etc.)
- PPT Pipelines: 35 (slide generation, speaker notes, transitions)
- Avatar Pipelines: 28 (S2V, lipsync, emotion, gesture)
- 3D Pipelines: 22 (model generation, animation, texture)
- Combination Pipelines: 76 (Avatar+Video, Avatar+PPT, 3D+Video, etc.)

---

## Content Pool in CREATE/PRODUCE/PUBLISH

### CREATE (Intent → Template Selection)

```typescript
import { useContentPool } from '@/hooks/useContentPool';

const CreateWizard = () => {
  const pool = useContentPool();
  
  // Wizard Step 1: Intent
  const intents = pool.pool?.products || [];
  
  // Wizard Step 2: Template
  // Filter by detected capabilities from intent-analyzer
  const recommendedTemplates = suggestedTemplates.filter(t =>
    t.style_preset.avatar === capabilityRequirements.lipsync
  );
  
  // Wizard Step 3: Messaging
  // Load product context + audience
  const productContext = pool.updateProductContext(
    selectedProduct.id,
    selectedRegion,
    selectedLanguage
  );
  
  const script = pool.pool?.getScriptForRegion(
    selectedProduct.id,
    selectedRegion
  );
  
  const tts = pool.pool?.getTTSForScript(script?.id || '');
};
```

### PRODUCE (Multi-Modal Generation)

```typescript
const Produce = () => {
  const pool = useContentPool();
  
  // Load production context
  const currentProduct = pool.pool?.getProductById(sessionProductId);
  const currentScript = pool.pool?.getScriptForRegion(productId, regionCode);
  const currentAudio = pool.pool?.getTTSForScript(currentScript?.id || '');
  
  // Execute pipelines based on template capability flags
  if (template.style_preset.avatar) {
    // Avatar pipeline
  }
  if (template.style_preset.animation) {
    // Animation pipeline
  }
  
  // Asset Lab: Generate derivatives (same content pool)
  const assetLabContext = {
    product: currentProduct,
    script: currentScript,
    audio: currentAudio,
    brand: pool.pool?.brandAssets,
  };
};
```

### PUBLISH (Distribution + Analytics)

```typescript
const Publish = () => {
  const pool = useContentPool();
  
  // Distribution context
  const publishingTargets = pool.pool?.audiences.filter(a =>
    a.industry === currentProduct?.target_industries[0]
  );
  
  // Scheduling based on region + audience preferences
  const timezone = getTimezoneForRegion(selectedRegion);
  const scheduleSlots = globalSchedulerService.getSlots(
    timezone,
    publishingTargets
  );
};
```

---

## Governance Integration

### Files Updated

1. **src/genie-studio/governance/UnifiedMetrics.ts**
   - New P0 component counts
   - useContentPool hook + intent-analyzer function

2. **src/genie-studio/governance/GenieStudioRegistry.ts**
   - Add to GENIE_HOOKS: "useContentPool"
   - Add to GENIE_EDGE_FUNCTIONS: "intent-analyzer"

3. **src/components/diagrams/genie-command-center/data/implementation-data.ts**
   - P0 Foundation: "Content Pool + Intent Router"
   - Status: "in-progress" → "done"

4. **docs/architecture/** (New)
   - `P0_FOUNDATION_CONTENT_POOL.md` (this file)
   - `DUAL_MODE_ARCHITECTURE.md`
   - `MULTI_MODAL_TEMPLATE_ORCHESTRATION.md`

---

## What's Next (P1+)

- **P1:** Tier gating + subscriber onboarding wizard
- **P2:** Campaign mode (primary + derivatives as single job)
- **P3:** White-label UI customization
- **P4:** Advanced audience segmentation + A/B testing

