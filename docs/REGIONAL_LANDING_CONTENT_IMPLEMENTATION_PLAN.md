# Regional Landing Content — Implementation Plan

> **Last Updated:** 2026-02-12
> **Status:** Phase A1 ✅ COMPLETE | Phase A2 ✅ COMPLETE | Phases A3–D ⏳ PENDING

---

## Overview

Database-driven regional landing pages replacing hardcoded TypeScript constants, aligned with the locked **82+ region routing registry** (`src/config/regional-routing-registry.ts`).

---

## Phase Map

| Phase | Name | Scope | Status | Depends On |
|-------|------|-------|--------|------------|
| **A1** | DB Foundation | `regional_landing_content` table + RLS + indexes | ✅ DONE | — |
| **A2** | Hook + Fallback + Device-Aware | `useRegionalLandingContent` hook with 3-tier fallback + device variants + mobile caching | ✅ DONE | A1 |
| **A3** | Component Integration | Wire `RegionalLandingPage.tsx` to read from DB instead of constants | ✅ DONE | A2 |
| **B1** | Asset Schema | Define JSONB structure for images, videos, 3D, avatars per region | ⏳ | A1 |
| **B2** | Asset Pipeline | Upload/CDN integration, asset management UI | ⏳ | B1 |
| **C1** | Content QA Agent | Agentic AI to validate brand tone, missing fields, SEO | ⏳ | A3 |
| **C2** | Cross-Regional Sync Agent | A2A agent that cascades English base updates to sub-region drafts | ⏳ | A3, C1 |
| **C3** | SEO & Visual Audit Agent | Auto-audit meta tags, OG images, RTL compliance per region | ⏳ | B2, C1 |
| **D1** | Admin Dashboard | CRUD UI for managing regional content with preview | ⏳ | A3 |
| **D2** | Approval Workflow | Review → Approve → Publish status pipeline with audit trail | ⏳ | D1 |

---

## Phase A1 — DB Foundation ✅ COMPLETE

### Table: `regional_landing_content`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK, auto-generated |
| `region_code` | TEXT | Constrained to 82+ locked codes |
| `headline` | TEXT | Required |
| `subheadline` | TEXT | Optional |
| `welcome_script` | TEXT | TTS narration script |
| `cta_primary_text` | TEXT | Default: 'Get Started' |
| `cta_primary_url` | TEXT | |
| `cta_secondary_text` | TEXT | |
| `cta_secondary_url` | TEXT | |
| `language_code` | TEXT | BCP47 code |
| `rtl_enabled` | BOOLEAN | Default: false |
| `assets` | JSONB | Empty `{}` until Phase B1 |
| `version` | INTEGER | Default: 1 |
| `status` | TEXT | draft / review / approved / active / archived |
| `created_by` | UUID | Auth user |
| `created_at` | TIMESTAMPTZ | Auto |
| `updated_at` | TIMESTAMPTZ | Auto via trigger |

### Region Codes (82+)

**Parent Regions (15):** WESTERN, EUR_NORTH, EUR_SOUTH, EUR_CENTRAL, EUR_EASTERN, EUR_BALKANS, MENA, AFR, IND, SEA, APAC, CJK, NAM, LATAM, CARIB

**Europe (15):** EU_GB, EU_FR, EU_DE, EU_IT, EU_ES, EU_NL, EU_BE, EU_CH, EU_AT, EU_PL, EU_CZ, EU_SE, EU_NO, EU_DK, EU_NORDIC

**India (12):** IND_HI, IND_EN, IND_TA, IND_TE, IND_KN, IND_ML, IND_MR, IND_GU, IND_BN, IND_PA, IND_OR, IND_UR

**CJK (4):** CJK_CN, CJK_TW, CJK_JP, CJK_KR

**SEA (5):** SEA_MALAY, SEA_THAI, SEA_VIET, SEA_PHIL, SEA_PAN

**MENA (5):** MENA_SA, MENA_AE, MENA_EG, MENA_IL, MENA_TR

**LATAM (5):** LATAM_BR, LATAM_MX, LATAM_AR, LATAM_CL, LATAM_CO

**Africa (5):** AFR_ZA, AFR_NG, AFR_KE, AFR_GH, AFR_EG

**NAM (3):** NAM_US, NAM_CA, NAM_MX

**Caribbean (3):** CARIB_EN, CARIB_FR, CARIB_HAI

**Oceania (2):** OCEANIA_AU, OCEANIA_NZ

**P0 Expansion:** TURKEY, INDONESIA

**P1 — Eastern Europe:** EU_UKRAINE, EU_CAUCASUS, EU_ARMENIA, EU_GEORGIA

**P1 — Central Asia:** ASIA_CENTRAL_KZ, ASIA_CENTRAL_UZ, ASIA_CENTRAL_AZ, ASIA_CENTRAL_TM, ASIA_CENTRAL_KG

### RLS Policies
- **SELECT:** Active content visible to all; drafts visible to authenticated users
- **INSERT/UPDATE:** Authenticated users only
- **DELETE:** Not permitted (archive instead)

### Indexes
- `region_code` — fast lookup
- `status` — filter active content
- `(region_code, version DESC)` — latest version retrieval
- `created_by` — user filtering

---

## Phase A2 — Hook + Fallback + Device-Aware ✅ COMPLETE

### `useRegionalLandingContent(regionCode)`
- **File:** `src/hooks/useRegionalLandingContent.ts`
- Query `regional_landing_content` for the given region code
- Fallback hierarchy: **Sub-Region → Parent Region → WESTERN (English Base)**
- Uses `SUB_REGION_TO_PARENT` mapping aligned with `regional-routing-registry.ts`
- Returns content + loading state + fallback tier indicator
- Caches via React Query with device-optimized stale times

### Device-Aware Features
| Feature | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Stale time | 10 min | 5 min | 5 min |
| GC time | 30 min | 15 min | 15 min |
| Headline | Condensed (≤50 chars) | Full | Full |
| Subheadline | Condensed (≤80 chars) | Full | Full |
| RTL support | ✅ | ✅ | ✅ |

### Return Interface
```typescript
{
  content: RegionalLandingRow | null;    // Best-match DB row
  variants: DeviceContentVariant | null; // Mobile/desktop text variants
  fallbackTier: 'exact' | 'parent' | 'base' | null;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  isRTL: boolean;
  isLoading: boolean;
  error: Error | null;
  isFetched: boolean;
}
```

---

## Phase A3 — Component Integration

- Replace hardcoded `REGION_CONFIGS` in `RegionalLandingPage.tsx`
- DB content takes precedence; falls back to existing constants if no DB row
- Zero breaking changes — existing pages continue working during rollout

---

## Phase B1 — Asset Schema ✅ COMPLETE

### JSONB `assets` Structure (Locked)

**File:** `src/types/regional-assets.ts`

```json
{
  "hero_image": {
    "url": "...",
    "alt": "...",
    "format": "webp|jpg|png|avif",
    "width": 1920,
    "height": 1080,
    "size_kb": 500
  },
  "hero_video": {
    "url": "...",
    "poster": "...",
    "duration": 30,
    "format": "mp4|webm|mov",
    "auto_play": true,
    "loop": true
  },
  "avatar_3d": {
    "model_url": "...",
    "animation": "idle|talking|gesturing",
    "format": "glb|gltf|fbx",
    "has_morphs": true
  },
  "og_image": {
    "url": "...",
    "width": 1200,
    "height": 630,
    "alt": "..."
  },
  "brand_logo": {
    "url": "...",
    "variant": "dark|light|mono|full-color",
    "format": "svg|png|webp"
  }
}
```

### Key Principles
- **URL-Only Storage**: All asset columns store CDN/blob URLs, NEVER binary data
- **Validation**: TypeScript types + runtime validators ensure schema compliance
- **Extensibility**: Additional assets can be added to the collection without schema migration
- **Metadata**: Each asset includes format, dimensions, and source tracking for analytics

### Included Utilities
- `validateRegionalAssets()` — Type guard for JSONB validation
- `createImageAsset()`, `createVideoAsset()`, `createOGImageAsset()` — Builder functions
- `mergeAssets()` — Fallback asset layering (region → parent → base)

---

## Phase B2 — Asset Pipeline

---

## Phase C — Agentic AI Automation

### C1: Content QA Agent
- Uses existing `agents` table + `ai-universal-processor`
- Validates: brand tone, missing required fields, placeholder detection, SEO meta
- Triggers on status change to "review"

### C2: Cross-Regional Sync Agent (A2A)
- When English base is approved, auto-generates draft rows for all leaf sub-regions
- Leverages existing `regional_narration_scripts` expansion pattern
- Uses `agent_communications` table for A2A messaging

### C3: SEO & Visual Audit Agent
- Checks OG tags, canonical URLs, RTL consistency, image alt text
- Runs on schedule or on-demand before publishing

---

## Phase D — Admin Dashboard & Workflow

### D1: Admin CRUD
- DataTable with region grouping (Parent → Leaf hierarchy)
- Inline editing for text fields
- Preview button showing rendered landing page

### D2: Approval Workflow
- Status pipeline: Draft → Review → Approved → Active
- Audit trail in `audit_logs` table
- Role-based permissions (superAdmin, workflowManager)

---

## Cross-References

| System | Alignment |
|--------|-----------|
| `regional-routing-registry.ts` | Region codes match exactly |
| `regional_narration_scripts` | Same `valid_region` constraint set |
| `marketing_languages` | Language codes shared |
| `useRegionalLandingNarration` | TTS fallback hierarchy reused |
| `agents` / `agent_workflows` | C-phase agents use existing infra |

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-12 | Phase A1 first (text only) | Assets can be added later without schema changes (JSONB) |
| 2026-02-12 | No workspace_id | Phase 4 multi-tenancy, user-scoped for now |
| 2026-02-12 | Agentic AI in Phase C (not A) | DB foundation must exist before agents can operate |
| 2026-02-12 | Archive instead of delete | Preserve content history for compliance |
