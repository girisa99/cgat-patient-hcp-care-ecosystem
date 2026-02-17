# Dual-Mode Architecture: Internal vs. Subscriber

> **Genie Suite:** Mind to Media  
> **Version:** 1.0.0  
> **Updated:** 2026-02-13  
> **Architecture:** Database-Driven, Multi-Tenant Ready

---

## System Architecture Overview

Genie Cast operates in **two modes simultaneously**, sharing 100% of infrastructure:

```
┌─────────────────────────────────────────────────────────────┐
│  SHARED INFRASTRUCTURE                                      │
├─────────────────────────────────────────────────────────────┤
│  • 434+ Templates (video_blueprints)                        │
│  • 206 Pipelines (combinationWorkflowService)               │
│  • 19 AI Providers (regional-routing-registry)              │
│  • useContentPool Hook                                      │
│  • intent-analyzer Edge Function                            │
│  • Asset Lab (20 types × 12 styles)                         │
└──────────┬──────────────────────────┬──────────────────────┘
           │                          │
    ┌──────▼────────┐        ┌───────▼──────────┐
    │ MODE 1        │        │ MODE 2           │
    │ INTERNAL      │        │ EXTERNAL         │
    ├───────────────┤        ├──────────────────┤
    │ Genie Suite   │        │ Subscriber SaaS  │
    │ Marketing     │        │ (White-Label)    │
    │               │        │                  │
    │ 8 Products:   │        │ User's Products: │
    │ • Spark       │        │ • Acme Healthcare│
    │ • Mind        │        │ • TechCorp SaaS  │
    │ • Vibe        │        │ • Edu Platform   │
    │ • Deck        │        │ • Etc.           │
    │ • Hub         │        │                  │
    │ • Cast        │        │ User's Branding: │
    │ • Ask Genie   │        │ • Logo, colors   │
    │ • Suite       │        │ • Tone, voice    │
    │               │        │ • Compliance     │
    │ System Default│        │                  │
    │ (visible to   │        │ RLS-Protected    │
    │  all users)   │        │ (user isolated)  │
    └───────────────┘        └──────────────────┘
```

---

## Data Isolation Model

### Database Security via RLS + is_system_default Flag

| Scenario | How It Works | Security |
|----------|---|---|
| **Admin views products** | Query returns: Genie defaults + admin's own | RLS allows system + user-owned |
| **Subscriber A views products** | Query returns: Genie defaults + Subscriber A's | RLS filters by `created_by` + `is_system_default` |
| **Subscriber B views products** | Query returns: Genie defaults + Subscriber B's | Same RLS, different user ID |

**Example RLS Policy:**
```sql
CREATE POLICY "Users see system defaults + own products"
  ON marketing_products
  FOR SELECT
  USING (is_system_default = true OR created_by = auth.uid());
```

### Content Pool Behavior

```typescript
const pool = useContentPool();

// Mode 1: Internal Admin
pool.products = [
  { id: 'spark', is_system_default: true, name: 'Genie Spark' },
  { id: 'mind', is_system_default: true, name: 'Genie Mind' },
  // ... all 8 Genie products
];

// Mode 2: Subscriber (Acme Healthcare)
pool.products = [
  { id: 'spark', is_system_default: true, name: 'Genie Spark' },     // Still visible!
  { id: 'mind', is_system_default: true, name: 'Genie Mind' },       // Still visible!
  // ... all 8 Genie defaults
  { id: 'acme-1', created_by: 'subscriber-id', name: 'SafeMeds' },   // Only theirs
  { id: 'acme-2', created_by: 'subscriber-id', name: 'CareFlow' },   // Only theirs
];
```

---

## Mode 1: Internal (Genie Suite Marketing)

### Setup
- **Users:** Genie team (isInternal = true, superAdmin role)
- **Products:** 8 pre-loaded Genie products (is_system_default = true)
- **Brand:** Genie logos, colors, fonts (system default)
- **Audiences:** 20-segment Genie matrix (system default)
- **Templates:** 434+ shared library (with regional variants)
- **Pipelines:** All 206 available
- **Regions:** All 82+ regions
- **AI Providers:** All 19 providers

### Workflow Example: "Create Vibe Demo for India"

```
1. LOGIN:
   → /genie-studio-auth (Google OAuth)
   → Route to /genie-cast (isInternal = true)

2. CREATE INTENT:
   → Natural Language: "Product demo for Vibe targeting Indian creators"
   → intent-analyzer classifies → "video" + "india" + "creator"

3. PRODUCT SELECTION:
   → pool.products = [8 Genie products]
   → Select: Vibe
   → Automatically loaded: Vibe screenshots, positioning, features

4. CONTENT POOL:
   → Scripts: Hindi transcreation for Vibe (from regional_narration_scripts)
   → TTS: Indian female voice, Hindi (from tts_audio_versions)
   → Audience: Creators (from marketing_audiences)
   → Framework: AIDA (for creator engagement)

5. PRODUCE:
   → Veo 3 video generation (Vibe + product context)
   → Asset Lab derivatives: thumbnail, banner, OG image
   → All using Genie brand assets

6. PUBLISH:
   → YouTube, Instagram, TikTok (creator platforms)
   → Analytics tracked in Genie dashboard
```

---

## Mode 2: External (Subscriber SaaS)

### Onboarding Flow

#### Step 1: Account + Subscription

```
User subscribes → Creator/Pro/Business/Enterprise tier

Tier: Pro
├── 3 products
├── 3 parent regions
├── 10 languages
├── Public template library only
├── 12 asset types
├── Avatar + Video + 3D pipelines (not all 206)
├── Azure TTS + Google Cloud (not all providers)
└── Campaign mode: ❌ (Business tier only)
```

#### Step 2: Product Registry

```typescript
addProductModal.open();

// User fills:
Product 1: "SafeMeds"
├── Tagline: "Medication safety platform for hospitals"
├── Screenshots: [uploaded 5 images]
├── Key Features: ["Drug interaction check", "Dosage calculator"]
├── Target Industries: ["Healthcare"]
└── Value Props: ["Reduce medication errors by 40%"]

// Stored as:
{
  id: 'uuid-xxx',
  created_by: 'subscriber-user-id',
  is_system_default: false,
  name: 'SafeMeds',
  // ... rest of fields
}
```

#### Step 3: Brand Setup

```typescript
brandSetupModal.open();

// User uploads:
├── Logo (light): SafeMeds logo white
├── Logo (dark): SafeMeds logo dark
├── Primary Color: #0066CC (HSL equivalent)
├── Secondary: #FF6600
├── Font: Inter (display), Roboto (body)
├── Voice Tone: Professional, healthcare-focused
└── Compliance: HIPAA notice, patient data guidelines

// Stored as:
{
  created_by: 'subscriber-user-id',
  is_system_default: false,
  logo_light_url: 'storage://...',
  primary_color: 'hsl(219, 100%, 40%)',
  // ... rest of fields
}
```

#### Step 4: Audience Definition

```typescript
audienceSetupModal.open();

// User defines personas:
Persona 1: "Hospital Administrator"
├── Industry: Healthcare
├── Job Title: Chief Medical Information Officer
├── Pain Points: ["Staff training costs", "Patient safety"]
├── Framework: JTBD (Job To Be Done)
└── Language Complexity: Technical

// Stored as:
{
  created_by: 'subscriber-user-id',
  is_system_default: false,
  persona_name: 'Hospital Administrator',
  preferred_framework: 'JTBD',
  // ... rest
}
```

#### Step 5: Region + Language Selection

```typescript
regionModal.open();

// User selects:
Target Regions:
├── MENA
│   ├── Saudi Arabia (Arabic, English)
│   └── UAE (Arabic, English)
├── LATAM
│   ├── Mexico (Spanish, English)
│   └── Brazil (Portuguese, English)
└── INDIA
    ├── North (Hindi, English)
    └── South (Tamil, Telugu, English)

// Stored in tier limits:
// Pro tier: 3 parent regions (MENA, LATAM, INDIA) ✅
// Pro tier: 10 languages (Arabic, English, Spanish, Portuguese, Hindi, Tamil, Telugu, ...) ✅
```

### Daily Workflow: "SafeMeds Training Video for Saudi Arabia"

```
1. LOGIN:
   → /genie-studio-auth (Google OAuth)
   → Route to /genie-cast (regular subscriber)

2. CREATE INTENT:
   Input: "Training video for SafeMeds mobile app, targeting Saudi nurses"
   
   intent-analyzer response:
   ├── detected_output_type: "video"
   ├── capability_requirements: { tts: true, lipsync: false, animation: true }
   ├── style_intent: "healthcare-professional"
   ├── recommended_region_llm: "qwen" (MENA routing)
   └── suggested_templates: ["Healthcare Training", "Product Demo", ...]

3. PRODUCT SELECTION:
   pool.products = [
     { Genie Spark },   // System default (visible but not editable)
     { SafeMeds }       // Subscriber's product
   ]
   
   Selected: SafeMeds
   → Product context loaded:
      - Screenshots from product_asset_inventory
      - Features: "Drug interaction check", "Dosage calc"
      - Positioning: "Reduce medication errors"

4. CONTENT CREATION:
   Template: "Healthcare Training Video"
   → Template has: 3 scenes, 2min 30sec, animation + TTS
   
   Script generation (ai-universal-processor):
   ├── Input region: MENA_SA
   ├── Detected LLM: Qwen Max (MENA provider from regional-routing-registry)
   ├── Prompt context: SafeMeds features + nurse audience + MENA healthcare culture
   ├── Output: Arabic script (Saudi dialect) + English subtitle
   └── Stored in: regional_narration_scripts (product_id = SafeMeds)
   
   TTS Generation (multi-provider-tts):
   ├── Language: ar-SA (Arabic - Saudi)
   ├── Provider: Alibaba (primary for MENA)
   ├── Voice: Female, professional tone
   ├── Output: Audio file (stored in tts_audio_versions)
   └── Duration: 150 seconds

5. ASSET LAB (Automatic Derivatives):
   Primary: SafeMeds training video (ar-SA)
   
   Derivatives (from Asset Lab):
   ├── Thumbnail: Key frame + SafeMeds logo
   ├── Hero Banner: First slide screenshot + tagline
   ├── LinkedIn Post: Video clip + engagement text
   ├── YouTube Card: Thumbnail + title
   ├── WhatsApp Status: 15-second clip
   └── All branded with SafeMeds colors + logo

6. TIER GATE CHECK:
   ✅ Pro tier includes:
      - Video pipeline
      - Animation support
      - 12 asset types (thumbnail, banner, etc.)
      - TTS: Alibaba (included in Pro)
   
   ❌ Not included in Pro:
      - White-label removal (Business tier)
      - Campaign mode (Business tier)
      - Advanced analytics (Business tier)

7. PUBLISH:
   Subscriber schedules to:
   ├── Internal: Hospital LMS (via SCORM export)
   ├── Public: YouTube, LinkedIn
   ├── Channels: Brand Instagram, TikTok
   └── Analytics: Tracked in subscriber dashboard only
```

---

## Feature Gating by Tier

### Products & Regions

| Tier | Products | Parent Regions | Sub-Regions |
|---|---|---|---|
| Creator | 1 | 1 | ❌ |
| Pro | 3 | 3 | ❌ |
| Business | 10 | All 15 | 1 level deep |
| Enterprise | ∞ | All 15 | All levels |

### Languages & Translation

| Tier | Languages | Transcreation | Regional Dialects |
|---|---|---|---|
| Creator | 3 | ❌ | ❌ |
| Pro | 10 | AI-assisted | ❌ |
| Business | 30 | Full | Up to 3 per region |
| Enterprise | 50+ | Full | All |

### Pipelines & AI

| Tier | Video | PPT | Avatar | 3D | Combinations | Total |
|---|---|---|---|---|---|---|
| Creator | 10 | 5 | ❌ | ❌ | ❌ | 15 |
| Pro | 20 | 10 | ✅ Basic | ❌ | ✅ Simple | 50 |
| Business | All | All | ✅ Advanced | ✅ Basic | ✅ All | 150+ |
| Enterprise | All 206 | All 206 | All | All | All | 206 |

### AI Provider Access

| Tier | Image | Video | Avatar | TTS | LLM |
|---|---|---|---|---|---|
| Creator | DALLE | Sora 1 | ❌ | Azure | Claude |
| Pro | + Imagen | + Veo 3 | Wan Lite | + Google | + Qwen |
| Business | All 5 | All 8 | Wan 2.2 | All 7 | All 4 primary |
| Enterprise | All | All | All | All | All 4 + fallbacks |

### Content & Customization

| Feature | Creator | Pro | Business | Enterprise |
|---|---|---|---|---|
| Public templates | ✅ | ✅ | ✅ | ✅ |
| Custom templates | ❌ | 5 | 50 | ∞ |
| Brand customization | Basic | Full | Full | White-label |
| Campaign mode | ❌ | ❌ | ✅ | ✅ |
| Analytics | Basic | Standard | Advanced | Custom |
| API access | ❌ | ❌ | Tier-limited | Full |
| Webhook support | ❌ | ❌ | ✅ | ✅ |

---

## Implementation Checklist

### Code (P0)
- [x] useContentPool hook
- [x] intent-analyzer edge function
- [ ] Tier gating middleware
- [ ] Subscriber onboarding wizard
- [ ] Product context manager

### Database (P0)
- [x] marketing_products + RLS
- [x] marketing_brand_assets + RLS
- [x] marketing_audiences + RLS
- [x] regional_narration_scripts (product FK)
- [x] tts_audio_versions
- [ ] subscription_tier_limits table
- [ ] subscriber_feature_access table

### Documentation (P0)
- [x] This dual-mode architecture doc
- [x] P0 Foundation doc
- [ ] Subscriber onboarding guide
- [ ] Tier gating implementation spec
- [ ] Migration guide (hardcoded → database)

### UI (P1)
- [ ] Subscriber onboarding flow
- [ ] Product management dashboard
- [ ] Brand asset uploader
- [ ] Audience persona builder
- [ ] Tier indicator in CREATE flow

---

## Key Principles

1. **100% Shared Infrastructure:** Both modes use identical pipelines, providers, routing
2. **RLS-Protected Data:** Subscriber data isolated automatically via database policies
3. **System Defaults Always Visible:** Genie products visible to all users (but not editable)
4. **Tier-Gated Features:** Limits set per subscription, enforced client + server-side
5. **Zero Code Duplication:** CREATE/PRODUCE/PUBLISH identical for both modes
6. **Database-Driven:** All product, brand, audience data comes from DB, not code

---

## Migration Path (Existing Hardcoded → Database-Driven)

### Phase 1: (Current) P0 Foundation
- useContentPool reads from database
- Fallback to existing constants if DB unavailable
- No changes to CREATE/PRODUCE/PUBLISH

### Phase 2: P1 Tier Gating
- Add subscription_tier_limits table
- Add tier checks in content pool queries
- Update CREATE wizard to filter by tier

### Phase 3: P2 Subscriber Mode
- Enable user onboarding (product + brand setup)
- RLS policies enforce isolation
- CREATE/PRODUCE/PUBLISH work identically for both modes

### Phase 4: P3+ White-Label
- Remove "Powered by Genie" branding
- Custom domain + SSL
- Advanced analytics + webhooks

