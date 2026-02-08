# Subscriber Product Onboarding Architecture
## How External Users Register Products & Services for Genie Cast Marketing

**Status:** 📝 PLANNED (Phase 3A → Phase 4)  
**Last Updated:** 2026-02-08  
**Dependencies:** Stripe Subscription (✅ Complete), Dynamic Marketing Registry (✅ Complete)

---

## 0. CRITICAL: Stripe vs. Product Registration — Two Separate Concerns

> **Stripe handles subscription access. Product registration is data onboarding — NOT a payment flow.**

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     TWO SEPARATE CONCERNS                                  │
│                                                                            │
│  ┌──────────────────────────────┐    ┌───────────────────────────────────┐ │
│  │ STRIPE (Payment Layer)       │    │ PRODUCT REGISTRATION (Data Layer) │ │
│  │                              │    │                                   │ │
│  │ • Subscription billing       │    │ • Product name, features, tagline │ │
│  │ • Tier access gating         │    │ • Target audiences & segments     │ │
│  │ • Usage limits enforcement   │    │ • Brand assets (logos, colors)    │ │
│  │ • Portal for plan changes    │    │ • Industry & category metadata   │ │
│  │                              │    │                                   │ │
│  │ PURPOSE: Control WHO can use │    │ PURPOSE: Tell Genie Cast WHAT     │ │
│  │ the platform and at what     │    │ to market — pure data input that  │ │
│  │ tier level.                  │    │ feeds the generation pipeline.    │ │
│  │                              │    │                                   │ │
│  │ NO RELATION to the products  │    │ NO PAYMENT involved. This is      │ │
│  │ being registered. Stripe     │    │ free functionality included in    │ │
│  │ doesn't know about "Acme    │    │ every subscription tier.          │ │
│  │ CRM" or "Acme Analytics".   │    │                                   │ │
│  └──────────────────────────────┘    └───────────────────────────────────┘ │
│                                                                            │
│  FLOW: Subscribe (Stripe) → Register Products (Data) → Generate (Pipeline)│
└────────────────────────────────────────────────────────────────────────────┘
```

### What Stripe Controls (Tier Limits Only)
| Tier Limit | Creator | Pro | Business | Enterprise |
|------------|---------|-----|----------|------------|
| Max products registered | 1 | 3 | 10 | Unlimited |
| Max custom audiences | 3 | 10 | 25 | Unlimited |
| Brand asset storage | 100MB | 500MB | 2GB | 10GB |
| Video generations/mo | 10 | 50 | 200 | Unlimited |

**Stripe knows nothing about the subscriber's products.** It only enforces: "Has this user hit their product registration limit for their tier?"

---

## 1. The Complete Subscriber Journey

```
┌──────────────────────────────────────────────────────────────────────────┐
│ SUBSCRIBER LIFECYCLE                                                      │
│                                                                          │
│  PHASE 1: SUBSCRIBE (Stripe — one-time payment setup)                    │
│  ──────────────────────────────────────────────────                       │
│  User selects tier (Creator/Pro/Business/Enterprise)                     │
│  → Stripe Checkout processes payment                                     │
│  → Webhook creates subscriber profile in user_subscriptions              │
│  → User gains access to Genie Cast platform                             │
│  → Stripe's job is DONE until renewal/upgrade/cancel                    │
│                                                                          │
│  PHASE 2: REGISTER PRODUCTS (Data onboarding — no payment involved)     │
│  ──────────────────────────────────────────────────────────────          │
│  Subscriber enters Genie Cast → "My Products" section                   │
│  → Registers their products/services (name, features, tagline)          │
│  → Defines their target audiences (custom or clone defaults)            │
│  → Uploads brand assets (logos, colors, screenshots)                    │
│  → Data stored in marketing_products, marketing_audiences,              │
│    marketing_brand_assets tables (user_id scoped, RLS isolated)         │
│  → This is FREE functionality within the subscription                   │
│                                                                          │
│  PHASE 3: GENERATE (Same pipeline as internal Genie products)           │
│  ─────────────────────────────────────────────────────────               │
│  → frameworkMessagingEngine generates tailored messaging                 │
│    using THEIR product data × THEIR audiences                           │
│  → genieCastOrchestrationService assembles scripts                      │
│    with THEIR brand context                                             │
│  → genie-cast-assembler produces final videos                           │
│    with THEIR logos, colors, product names                              │
│  → Output → Subscriber's Content Library (RLS-isolated)                 │
│                                                                          │
│  PHASE 4: DISTRIBUTE (Optional — tier-gated)                            │
│  ────────────────────────────────────────────                            │
│  → Manual download (all tiers)                                          │
│  → Platform publishing (Pro+)                                           │
│  → API access (Enterprise)                                              │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Current State: Internal (Genie Studio Products)

Today, Genie Cast markets the **8 internal Genie products** using this pipeline:

```
┌─────────────────────────────────────────────────────────────────┐
│ INTERNAL MODE (Current — Dogfooding / Production Proof)         │
│                                                                 │
│  marketing_products (8 Genie products, is_system_default=true)  │
│          ↓                                                      │
│  marketing_audiences (20 segments, is_system_default=true)      │
│          ↓                                                      │
│  frameworkMessagingEngine (20-segment × 7-product matrix)        │
│          ↓                                                      │
│  genieCastOrchestrationService (script + TTS + visuals)         │
│          ↓                                                      │
│  genie-cast-assembler (edge function → final video)             │
│          ↓                                                      │
│  Content Library → Scheduler → Distribution                     │
└─────────────────────────────────────────────────────────────────┘
```

**Key Services Already Reusable:**
| Service | File | Cross-Functional? |
|---------|------|-------------------|
| `dynamicMarketingRegistryService` | `src/services/marketing/dynamicMarketingRegistryService.ts` | ✅ Yes — `user_id` + `is_system_default` flags ready |
| `frameworkMessagingEngine` | `src/services/marketing/frameworkMessagingEngine.ts` | ✅ Yes — audience matrix is dynamic |
| `genieCastOrchestrationService` | `src/services/marketing/genieCastOrchestrationService.ts` | ✅ Yes — product-agnostic script assembly |
| `unifiedMediaOrchestrator` | `src/services/shared/unifiedMediaOrchestrator.ts` | ✅ Yes — provider routing is product-neutral |
| `useUnifiedAuthoring` | `src/hooks/useUnifiedAuthoring.ts` | ✅ Yes — 8-stage workflow shared across all products |
| `ai-universal-processor` | `supabase/functions/ai-universal-processor/` | ✅ Yes — LLM/TTS/Video routing is context-driven |

---

## 3. External Subscriber Mode

External subscribers register **their own products/services** and use the **exact same pipeline**:

```
┌──────────────────────────────────────────────────────────────────┐
│ EXTERNAL MODE (Subscriber)                                       │
│                                                                  │
│  Subscriber has active Genie Cast subscription (Stripe)          │
│          ↓                                                       │
│  "My Products" section: Register products (is_system_default=    │
│  false, user_id=auth.uid())                                      │
│          ↓                                                       │
│  Define target audiences (custom or select from 20 defaults)     │
│          ↓                                                       │
│  Upload brand assets (logos, screenshots, colors, fonts)          │
│          ↓                                                       │
│  Same frameworkMessagingEngine generates tailored messaging       │
│  using subscriber's product features + audiences                 │
│          ↓                                                       │
│  Same genieCastOrchestrationService assembles scripts            │
│  with subscriber's brand context                                 │
│          ↓                                                       │
│  Same genie-cast-assembler produces final videos                 │
│  with subscriber's logos, colors, product names in overlays      │
│          ↓                                                       │
│  Subscriber's Content Library → their Scheduler → Distribution   │
└──────────────────────────────────────────────────────────────────┘
```

### Why This Works Without Code Changes
The entire pipeline is **product-agnostic by design**. The services don't care whether the product is "Genie Spark" or "Acme CRM" — they receive a `MarketingProduct` object and generate accordingly. The **only difference** is where the product data comes from:

| Mode | Product Source | Audience Source | Brand Source |
|------|---------------|-----------------|--------------|
| Internal | `marketing_products WHERE is_system_default=true` | `marketing_audiences WHERE is_system_default=true` | `marketing_brand_assets WHERE is_system_default=true` |
| External | `marketing_products WHERE user_id=auth.uid()` | Custom + selected defaults | `marketing_brand_assets WHERE user_id=auth.uid()` |

---

## 4. Database Architecture (Already Supports This)

### 4.1 How `is_system_default` + `user_id` Enables Dual Mode

```sql
-- INTERNAL: Genie's own products (visible to all, managed by admins)
SELECT * FROM marketing_products WHERE is_system_default = true;
-- Returns: Genie Studio, Spark, Mind, Vibe, Arc, Deck, Cast, Ask Genie

-- EXTERNAL: Subscriber's products (visible only to them via RLS)
SELECT * FROM marketing_products WHERE user_id = auth.uid();
-- Returns: "Acme CRM", "Acme Analytics", etc.

-- SUBSCRIBER VIEW: They see ONLY their own products
-- System default products serve as TEMPLATES they can reference, not competitors
-- Subscribers CANNOT see other subscribers' products (RLS enforced)
```

### 4.2 Existing Tables (No New Tables Needed for MVP)

| Table | Internal Use | External Subscriber Use |
|-------|-------------|------------------------|
| `marketing_products` | 8 Genie products (`is_system_default=true`) | Subscriber products (`user_id=auth.uid()`, `is_system_default=false`) |
| `marketing_audiences` | 20 default segments | Subscriber custom audiences OR select from defaults |
| `marketing_languages` | 14 languages | Same languages, subscriber selects which to enable |
| `marketing_brand_assets` | Genie logos, screenshots | Subscriber logos, screenshots, color palettes |

### 4.3 RLS Policy Pattern

```sql
-- Products: See system defaults + your own
CREATE POLICY "Users see system defaults and own products"
ON marketing_products FOR SELECT
USING (is_system_default = true OR user_id = auth.uid());

-- Products: Only modify your own
CREATE POLICY "Users manage own products"
ON marketing_products FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND is_system_default = false);
```

---

## 5. Product Registration Flow (Data Onboarding)

### 5.1 What Subscribers Provide

> This is **not a payment form**. This is telling Genie Cast "here's what I need you to market for me."

```
PRODUCT REGISTRATION (Data Onboarding — FREE within subscription)
═══════════════════════════════════════════════════════════════════

Step 1: COMPANY PROFILE
├── Company name
├── Industry / vertical
├── Website URL (optional — enables AI auto-fill)
└── Company description

Step 2: REGISTER PRODUCTS (repeatable per tier limit)
├── Product/service name
├── Tagline / value proposition
├── Description (what it does, who it's for)
├── Key features (list — AI can extract from URL)
├── Category (SaaS, eCommerce, Healthcare, Service, Physical, etc.)
├── Primary/secondary brand colors (color picker)
└── "Add another product" (if tier allows)

Step 3: TARGET AUDIENCES
├── Option A: Select from 20 system default segments (checkboxes)
│   → "Healthcare Decision Makers", "SMB Owners", "Tech Startups", etc.
├── Option B: Define custom audiences
│   ├── Audience label (e.g., "Hospital Administrators")
│   ├── Pain points they experience
│   ├── Messaging angles that resonate
│   └── Industry vertical
└── Option C: AI suggests audiences based on product category
    → Uses ai-universal-processor to analyze product and recommend

Step 4: BRAND ASSETS
├── Logo (primary + icon variants)
├── Product screenshots (drag & drop, up to tier storage limit)
├── Brand colors (auto-extracted from logo if not manually set)
├── Brand fonts (optional)
└── Social media links (for distribution integration)

→ ALL DATA SAVED TO: marketing_products, marketing_audiences,
  marketing_brand_assets tables (user_id scoped, RLS isolated)
→ NO PAYMENT INVOLVED — this is included in the subscription
```

### 5.2 AI-Assisted Product Setup (Phase 3B)

When a subscriber provides their website URL:
1. `ai-universal-processor` scrapes the URL
2. Extracts: product name, description, features, brand colors, screenshots
3. Auto-populates registration form
4. Subscriber reviews and confirms

This reuses the existing `analyze_seo` action in `ai-universal-processor`.

---

## 6. How Each Service Adapts for External Products

### 6.1 `dynamicMarketingRegistryService` (Already Ready ✅)

```typescript
// Current: Internal admin fetches Genie products
const genieProducts = await dynamicMarketingRegistryService.getProducts({ systemOnly: true });

// Future: Subscriber fetches THEIR products
const myProducts = await dynamicMarketingRegistryService.getProducts({ userOnly: true });

// Creating a subscriber product (method already exists)
await dynamicMarketingRegistryService.createProduct({
  user_id: currentUserId,
  name: 'Acme CRM',
  tagline: 'Manage relationships, close deals',
  category: 'SaaS',
  features: ['Pipeline tracking', 'Email automation', 'Analytics'],
  is_system_default: false,  // ← This is the key differentiator
  is_active: true,
});
```

### 6.2 `frameworkMessagingEngine` (Needs Extension)

```typescript
// Current: Hardcoded PRODUCT_MESSAGING for Genie products
// Future: Dynamic product messaging loaded from marketing_products

// Extension: Accept a MarketingProduct object, generate messaging dynamically
frameworkMessagingEngine.composeFrameworkScript(
  audience: 'healthcare',
  productId: 'acme-crm',           // Subscriber's product ID
  sceneCount: 4,
  productContext: subscriberProduct  // NEW: Pass full product data
);
```

### 6.3 `genieCastOrchestrationService` (Needs Extension)

```typescript
// Current: Uses GENIE_PRODUCTS constant for script context
// Future: Accepts dynamic product from registry

// Extension: getChapterScript() accepts a MarketingProduct
// instead of looking up from hardcoded constants
```

### 6.4 `genie-cast-assembler` Edge Function (Needs Extension)

```typescript
// Current: Assembles video with Genie branding
// Future: Assembles video with SUBSCRIBER branding

// The edge function needs to:
// 1. Accept product_id in request body
// 2. Load product + brand assets from marketing_products + marketing_brand_assets
// 3. Inject subscriber's logo/colors into video template
// 4. Use subscriber's product name/tagline in overlays
```

---

## 7. Stripe's Role: Subscription Access & Tier Gating ONLY

### 7.1 What Stripe Handles
```
Stripe Responsibility:
├── Collect payment (Checkout)
├── Manage subscription lifecycle (create, renew, cancel, upgrade)
├── Enforce tier limits:
│   ├── "Can this user register another product?" (check count vs tier max)
│   ├── "Can this user upload more assets?" (check storage vs tier max)
│   ├── "Can this user generate more videos?" (check monthly count vs tier max)
│   └── "Can this user use multi-language?" (check tier level)
├── Customer portal (self-service billing management)
└── Webhooks (sync subscription status to user_subscriptions table)
```

### 7.2 What Stripe Does NOT Handle
```
NOT Stripe's Concern:
├── What products the subscriber registers
├── What audiences they define
├── What brand assets they upload
├── What content they generate
├── What templates they use
└── Anything about the subscriber's business/products
```

### 7.3 Tier Enforcement Points

| Enforcement Point | How It Works |
|-------------------|--------------|
| Product registration limit | Before `createProduct()`, check `COUNT(*) FROM marketing_products WHERE user_id=auth.uid()` against tier.max_products |
| Brand asset storage limit | Before upload, check total storage used vs tier.max_storage |
| Monthly video generations | Before generation, check `COUNT(*) FROM generated_content WHERE user_id=auth.uid() AND created_at > start_of_month()` vs tier.max_generations |
| Template access | Filter template library by `tier_access_level` column |
| Language availability | Filter `marketing_languages` by tier-allowed count |

### 7.4 Full Tier-Based Access Control

| Feature | Creator | Pro | Business | Enterprise |
|---------|---------|-----|----------|------------|
| Products registered | 1 | 3 | 10 | Unlimited |
| Custom audiences | 3 | 10 | 25 | Unlimited |
| Brand asset storage | 100MB | 500MB | 2GB | 10GB |
| Video generations/mo | 10 | 50 | 200 | Unlimited |
| Languages | 2 | 5 | 14 | 14+ custom |
| Templates access | Basic (50) | Full (434) | Full + Custom | Full + Custom + Priority |
| Matrix generation | Single | Batch (5) | Full matrix | Full + API |
| Distribution channels | Manual DL | 3 platforms | All platforms | All + API + White-label |
| AI-assisted setup | ❌ | ✅ | ✅ | ✅ + Priority |
| Analytics dashboard | Basic | Standard | Advanced | Advanced + Export |

---

## 8. Data Isolation & Security

### 8.1 Subscriber Data Isolation

```
┌─────────────────────────────────────────┐
│ Subscriber A (user_id = 'abc-123')      │
│  ├── marketing_products: 2 products     │
│  ├── marketing_audiences: 5 audiences   │
│  ├── marketing_brand_assets: logos, etc. │
│  └── Content Library: their videos only  │
├─────────────────────────────────────────┤
│ Subscriber B (user_id = 'def-456')      │
│  ├── marketing_products: 1 product      │
│  ├── marketing_audiences: 3 audiences   │
│  ├── marketing_brand_assets: logos, etc. │
│  └── Content Library: their videos only  │
├─────────────────────────────────────────┤
│ System Defaults (is_system_default=true)│
│  ├── 20 default audience segments       │
│  ├── 14 languages with TTS mappings     │
│  └── 434 video templates                │
│  (Visible to all, editable by none)     │
└─────────────────────────────────────────┘
```

### 8.2 Storage Bucket Strategy

```
brand-assets/
├── system/          ← Genie logos (public, read-only)
├── {user_id}/       ← Subscriber assets (private, RLS-gated)
│   ├── logos/
│   ├── screenshots/
│   ├── colors/
│   └── fonts/
```

---

## 9. What Needs to Be Built (Prioritized)

### Phase 3A: User-Scoped Product Registration (Weeks 3-4)

| # | Task | Complexity | Dependencies |
|---|------|-----------|--------------|
| 1 | "My Products" section in Genie Cast settings | Medium | Design mockups |
| 2 | Product Registration Form UI (data input, no payment) | Medium | #1 |
| 3 | Audience Selection/Creation UI | Medium | #2 |
| 4 | Brand Asset Upload Component | Medium | Storage bucket setup |
| 5 | `frameworkMessagingEngine` extension for dynamic products | Medium | #2 |
| 6 | `genie-cast-assembler` extension for subscriber branding | Medium | #4 |
| 7 | Tier-based limit enforcement (count checks, not payment) | Low | Subscription hook |

### Phase 3B: Onboarding Wizard & AI Setup (Weeks 4-5)

| # | Task | Complexity | Dependencies |
|---|------|-----------|--------------|
| 1 | Post-signup onboarding wizard (4 screens) | High | Phase 3A |
| 2 | AI-assisted product setup (URL scraping) | Medium | ai-universal-processor |
| 3 | Brand color auto-extraction from logo | Low | Image processing |
| 4 | Audience AI suggestions from product category | Medium | LLM routing |

### Phase 4: Multi-Tenancy (Weeks 6-8)

| # | Task | Complexity | Dependencies |
|---|------|-----------|--------------|
| 1 | Workspace model (teams sharing products) | High | Auth redesign |
| 2 | Workspace-scoped RLS migration | High | DB migration |
| 3 | Team member roles (admin/editor/viewer) | Medium | RBAC |
| 4 | White-label domain support | High | DNS/routing |

---

## 10. What Does NOT Change Between Internal & External

The following remain **identical** for internal and external users:

| Component | Why It's Shared |
|-----------|----------------|
| 434+ template library | Templates are structural blueprints, not product-specific |
| `ai-universal-processor` | LLM/TTS/Video routing is product-agnostic |
| `unifiedMediaOrchestrator` | Media pipeline doesn't care whose product it is |
| `useUnifiedAuthoring` | 8-stage workflow is universal |
| `frameworkMessagingEngine` | Messaging logic is audience×product matrix — works with any product |
| Provider routing (7-zone) | Regional TTS/video providers are infrastructure |
| Quality/rendering pipeline | Video quality is tier-gated, not product-specific |

---

## 11. Key Design Decision: Genie Products Visibility

**Question:** Should subscribers see Genie's own products?

**Recommendation:** No. External subscribers should see ONLY their registered products.

```typescript
// Internal admin view:
getProducts({ systemOnly: true }) → 8 Genie products

// Subscriber view:
getProducts({ userOnly: true }) → Their registered products only

// BUT: Subscribers CAN see system default AUDIENCES and TEMPLATES
// (these are useful starting points, not competitive products)
```

---

## 12. Summary: Internal vs External Comparison

| Aspect | Internal (Current) | External (Planned) |
|--------|-------------------|-------------------|
| Products | 8 Genie products (seeded) | Subscriber-registered (dynamic) |
| Audiences | 20 system defaults | Custom + selected defaults |
| Brand Assets | Genie logos/screenshots | Subscriber uploads |
| Messaging | Genie-specific copy | AI-generated for subscriber's product |
| Templates | Full 434+ library | Tier-gated access |
| Video Output | Genie marketing collateral | Subscriber marketing collateral |
| Distribution | Genie social channels | Subscriber's connected platforms |
| Data Isolation | Admin-only | RLS per user_id |
| Pipeline | Same | Same |
| AI Providers | Same | Same |
| Quality | Same | Same (tier-gated resolution) |
| **Payment** | **N/A (internal)** | **Stripe subscription for platform access only** |
| **Product Registration** | **Seeded data** | **Free data onboarding within subscription** |

---

## 13. Genie Studio as Underlying Platform

```
┌──────────────────────────────────────────────────────────────────────┐
│                    GENIE STUDIO ECOSYSTEM                             │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ SHARED INFRASTRUCTURE (used by ALL products & subscribers)     │  │
│  │                                                                │  │
│  │  ai-universal-processor    unifiedMediaOrchestrator            │  │
│  │  unifiedProviderRouter     useUnifiedAuthoring                 │  │
│  │  frameworkMessagingEngine   dynamicMarketingRegistryService     │  │
│  │  7-zone regional routing   434+ template library               │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                           ↑ ↑ ↑ ↑ ↑                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐ │
│  │Spark │ │ Mind │ │ Vibe │ │ Deck │ │ Arc  │ │ Cast │ │Ask     │ │
│  │      │ │      │ │      │ │      │ │      │ │      │ │Genie   │ │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──┬───┘ └────────┘ │
│                                                   │                  │
│                                    ┌──────────────┴──────────────┐  │
│                                    │ GENIE CAST AS SUBSCRIPTION  │  │
│                                    │ SERVICE FOR EXTERNAL USERS  │  │
│                                    │                             │  │
│                                    │ Subscriber registers their  │  │
│                                    │ products (data onboarding)  │  │
│                                    │ → Same pipeline generates   │  │
│                                    │   tailored marketing for    │  │
│                                    │   THEIR products/services   │  │
│                                    │                             │  │
│                                    │ Stripe only gates:          │  │
│                                    │ • Platform access           │  │
│                                    │ • Tier limits               │  │
│                                    │ • Feature availability      │  │
│                                    └─────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

**Next Steps:** This document serves as the planning blueprint. Implementation begins at Phase 3A. No new tables needed — the existing `marketing_*` schema is already designed for this dual-mode operation. Stripe integration is already complete and handles subscription access only; product registration is a separate data onboarding concern with no payment involvement.
