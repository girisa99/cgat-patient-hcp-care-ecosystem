# Subscriber Product Onboarding Architecture
## How External Users Register Products & Services for Genie Cast Marketing

**Status:** 📝 PLANNED (Phase 3A → Phase 4)  
**Last Updated:** 2026-02-08  
**Dependencies:** Stripe Integration, Dynamic Marketing Registry (✅ Complete)

---

## 1. Current State: Internal (Genie Studio Products)

Today, Genie Cast markets the **8 internal Genie products** using this pipeline:

```
┌─────────────────────────────────────────────────────────────────┐
│ INTERNAL MODE (Current)                                         │
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

## 2. Future State: External Subscriber Mode

External subscribers will register **their own products/services** and use the same pipeline:

```
┌──────────────────────────────────────────────────────────────────┐
│ EXTERNAL MODE (Subscriber)                                       │
│                                                                  │
│  Subscriber signs up via Stripe (Creator/Pro/Business tier)      │
│          ↓                                                       │
│  Onboarding Wizard: Register products (is_system_default=false)  │
│          ↓                                                       │
│  Define target audiences (custom or select from 20 defaults)     │
│          ↓                                                       │
│  Upload brand assets (logos, screenshots, colors, fonts)          │
│          ↓                                                       │
│  Same frameworkMessagingEngine generates tailored messaging       │
│          ↓                                                       │
│  Same genieCastOrchestrationService assembles scripts            │
│          ↓                                                       │
│  Same genie-cast-assembler produces final videos                 │
│          ↓                                                       │
│  Subscriber's Content Library → their Scheduler → Distribution   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Architecture (Already Supports This)

### 3.1 How `is_system_default` + `user_id` Enables Dual Mode

```sql
-- INTERNAL: Genie's own products (visible to all, managed by admins)
SELECT * FROM marketing_products WHERE is_system_default = true;
-- Returns: Genie Studio, Spark, Mind, Vibe, Arc, Deck, Cast, Ask Genie

-- EXTERNAL: Subscriber's products (visible only to them via RLS)
SELECT * FROM marketing_products WHERE user_id = auth.uid();
-- Returns: "Acme CRM", "Acme Analytics", etc.

-- COMBINED: What a subscriber sees when generating
SELECT * FROM marketing_products 
WHERE is_system_default = true OR user_id = auth.uid();
-- For subscribers: They see ONLY their own products (not Genie's)
-- The is_system_default products are templates/examples they can clone
```

### 3.2 Existing Tables (No New Tables Needed for MVP)

| Table | Internal Use | External Subscriber Use |
|-------|-------------|------------------------|
| `marketing_products` | 8 Genie products (`is_system_default=true`) | Subscriber products (`user_id=auth.uid()`, `is_system_default=false`) |
| `marketing_audiences` | 20 default segments | Subscriber custom audiences OR select from defaults |
| `marketing_languages` | 14 languages | Same languages, subscriber selects which to enable |
| `marketing_brand_assets` | Genie logos, screenshots | Subscriber logos, screenshots, color palettes |

### 3.3 RLS Policy Pattern

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

## 4. Subscriber Onboarding Flow (Planned)

### 4.1 Registration Journey

```
Step 1: SUBSCRIBE
├── User selects tier (Creator / Pro / Business / Enterprise)
├── Stripe Checkout processes payment
├── Webhook creates subscriber profile
└── Redirect to Onboarding Wizard

Step 2: REGISTER PRODUCTS (Onboarding Wizard)
├── Screen 1: Company Info
│   ├── Company name, industry, website URL
│   └── AI auto-suggests product category from website
│
├── Screen 2: Product Registration (repeatable)
│   ├── Product name, tagline, description
│   ├── Key features (comma-separated or AI-extracted from URL)
│   ├── Primary/secondary brand colors (color picker)
│   ├── Category selection (SaaS, eCommerce, Service, Physical, etc.)
│   └── "Add another product" button
│
├── Screen 3: Target Audiences
│   ├── Select from 20 default segments (checkboxes)
│   ├── OR define custom audiences:
│   │   ├── Audience label
│   │   ├── Pain points (text list)
│   │   ├── Messaging angles
│   │   └── Industry vertical
│   └── AI suggests audiences based on product category
│
├── Screen 4: Brand Assets Upload
│   ├── Logo (primary + icon variants)
│   ├── Product screenshots (drag & drop)
│   ├── Brand colors (auto-extracted from logo if not set)
│   ├── Brand fonts (optional)
│   └── Existing website/social links
│
└── Step 3: GENERATE
    ├── Template selection (from 434+ library)
    ├── Messaging auto-generated for THEIR product × THEIR audiences
    ├── Video production uses THEIR brand assets
    └── Output → Subscriber's Content Library
```

### 4.2 AI-Assisted Product Setup

When a subscriber provides their website URL:
1. `ai-universal-processor` scrapes the URL
2. Extracts: product name, description, features, brand colors, screenshots
3. Auto-populates registration form
4. Subscriber reviews and confirms

This reuses the existing `analyze_seo` action in `ai-universal-processor`.

---

## 5. How Each Service Adapts for External Products

### 5.1 `dynamicMarketingRegistryService` (Already Ready ✅)

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
  // ...brand colors, icon, etc.
});
```

### 5.2 `frameworkMessagingEngine` (Needs Extension)

```typescript
// Current: Hardcoded PRODUCT_MESSAGING for Genie products
// Future: Dynamic product messaging loaded from marketing_products

// The engine needs to:
// 1. Accept a MarketingProduct object (not just a hardcoded product ID)
// 2. Generate messaging based on product.features + product.tagline
// 3. Map to audience framework using product.category → framework selection

// Extension point (not new service — extend existing):
frameworkMessagingEngine.composeFrameworkScript(
  audience: 'healthcare',
  productId: 'acme-crm',           // Subscriber's product ID
  sceneCount: 4,
  productContext: subscriberProduct  // NEW: Pass full product data
);
```

### 5.3 `genieCastOrchestrationService` (Needs Extension)

```typescript
// Current: Uses GENIE_PRODUCTS constant for script context
// Future: Accepts dynamic product from registry

// Extension: getChapterScript() should accept a MarketingProduct
// instead of looking up from hardcoded constants
```

### 5.4 `genie-cast-assembler` Edge Function (Needs Extension)

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

## 6. Tier-Based Access Control

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

---

## 7. Data Isolation & Security

### 7.1 Subscriber Data Isolation

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

### 7.2 Storage Bucket Strategy

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

## 8. What Needs to Be Built (Prioritized)

### Phase 3A: User-Scoped Product Registration (Weeks 3-4)

| # | Task | Complexity | Dependencies |
|---|------|-----------|--------------|
| 1 | Product Registration Form UI | Medium | Design mockups |
| 2 | Audience Selection/Creation UI | Medium | Form UI |
| 3 | Brand Asset Upload Component | Medium | Storage bucket setup |
| 4 | `frameworkMessagingEngine` extension for dynamic products | Medium | Product form |
| 5 | `genie-cast-assembler` extension for subscriber branding | Medium | Brand assets |
| 6 | Tier-based product limits enforcement | Low | Stripe tiers |

### Phase 3B: Onboarding Wizard (Weeks 4-5)

| # | Task | Complexity | Dependencies |
|---|------|-----------|--------------|
| 1 | Post-signup onboarding wizard (4 screens) | High | Stripe webhooks |
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

## 9. Architectural Flow Diagram

```
SUBSCRIBER JOURNEY
==================

[Stripe Checkout] → [Webhook] → [Profile Created]
        ↓
[Onboarding Wizard]
    ├── Register Product(s) → marketing_products (user_id, is_system_default=false)
    ├── Define Audiences    → marketing_audiences (user_id, or clone defaults)
    ├── Upload Brand Assets → marketing_brand_assets (user_id) + storage bucket
    └── Select Languages    → marketing_languages (user preferences)
        ↓
[Genie Cast Dashboard] (SAME UI as internal, filtered by user_id)
    ├── Templates (434+ shared library)
    ├── Messaging (frameworkMessagingEngine with THEIR product data)
    ├── Production (genieCastOrchestrationService with THEIR brand)
    └── Distribution (unifiedEcosystemPublishingService)
        ↓
[Content Library] (user-scoped, RLS-isolated)
    ├── Generated videos with THEIR branding
    ├── Scheduler (their posting schedule)
    └── Analytics (their performance metrics)
```

---

## 10. What Does NOT Change

The following remain **identical** for internal and external users:

| Component | Why It's Shared |
|-----------|----------------|
| 434+ template library | Templates are structural blueprints, not product-specific |
| `ai-universal-processor` | LLM/TTS/Video routing is product-agnostic |
| `unifiedMediaOrchestrator` | Media pipeline doesn't care whose product it is |
| `useUnifiedAuthoring` | 8-stage workflow is universal |
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
| Products | 8 Genie products (hardcoded seeds) | Subscriber-registered (dynamic) |
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

---

**Next Steps:** This document serves as the planning blueprint. Implementation begins at Phase 3A after Stripe integration is complete. No new tables needed — the existing `marketing_*` schema is already designed for this dual-mode operation.
