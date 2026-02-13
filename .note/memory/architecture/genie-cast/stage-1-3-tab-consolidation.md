# Memory: architecture/genie-cast/stage-1-3-tab-consolidation
Updated: 2025-02-13

## Stage 1 Implementation: Sidebar Removal + 3-Tab Consolidation

### Overview
Transitioned from 4-tab (CREATE/PRODUCE/MANAGE/PUBLISH/LANDING) to streamlined **3-tab architecture** (CREATE → PRODUCE → PUBLISH) with full sidebar removal on `/genie-cast` route.

### Changes Made

#### 1. **Sidebar Removal** (GenieStudioLayout.tsx)
- Added route detection: `isGenieCastRoute = location.pathname === '/genie-cast'`
- `/genie-cast` now renders **full-width immersive layout** (no sidebar)
- Maintains sidebar for all other routes (non-Genie-Cast)
- Preserves AskGenie FAB in both layouts

#### 2. **Tab Consolidation** (GenieCastConsolidatedTabs.tsx)

**FROM 5 tabs:**
- CREATE (templates, messaging, production)
- PRODUCE (generate, matrix, studio, review)
- MANAGE (library, analytics, flow, repurpose)
- PUBLISH (scheduler, distribution, seo, testing)
- LANDING (scripts, hero-banners, assets-lab, meeting-prep)

**TO 3 tabs:**

**CREATE Tab** (Intent-Driven Entry)
- **intent**: What are you creating? (Product video | Hero Banner | Social | Landing Section)
- **templates**: Blueprint selection (auto-filtered by intent)
- **messaging**: AI copy generation + existing scripts (unified with Landing scripts)
- **assets**: Hero Banners, Assets Lab, Brand Assets, Screenshots (LANDING consolidated here)

**PRODUCE Tab** (Generation + Management)
- **generate**: Single or batch video generation
- **matrix**: Batch production matrix
- **studio**: Timeline editor
- **review**: Quality review & enhancement
- **library**: Video content library (MANAGE → PRODUCE)
- **analytics**: Performance metrics (MANAGE → PRODUCE)
- **flow**: Pipeline visualization (MANAGE → PRODUCE)

**PUBLISH Tab** (Distribution)
- **scheduler**: Content calendar
- **distribution**: Multi-platform publishing
- **seo**: Search optimization
- **testing**: A/B Test variations

### Type Updates
```typescript
// OLD
export type ConsolidatedTab = 'create' | 'produce' | 'manage' | 'publish' | 'landing';
export type CreateSubTab = 'templates' | 'messaging' | 'production';
export type ManageSubTab = 'library' | 'analytics' | 'flow' | 'repurpose';
export type LandingSubTab = 'scripts' | 'hero-banners' | 'assets-lab' | 'meeting-prep';

// NEW
export type ConsolidatedTab = 'create' | 'produce' | 'publish';
export type CreateSubTab = 'intent' | 'templates' | 'messaging' | 'assets';
export type ProduceSubTab = 'generate' | 'matrix' | 'studio' | 'review' | 'library' | 'analytics' | 'flow';
```

### User Flow
1. **CREATE** → User selects intent (what they're building) → auto-filters templates/messaging/assets
2. **PRODUCE** → Generate/edit videos → review + manage library
3. **PUBLISH** → Schedule/distribute/optimize

### Files Modified
- `src/components/layout/GenieStudioLayout.tsx` - Sidebar hiding logic
- `src/components/genie-admin/genie-cast/GenieCastConsolidatedTabs.tsx` - Tab definitions + types

### Remaining Work (Stages 2-3)
- **Stage 2**: Build Intent selector in CREATE + context bar
- **Stage 3**: Sub-component implementations for each tab

### Asset Inventory Integration (Future)
Once Stage 1 is stable, the Assets step in CREATE will integrate:
- **Coverage tracking** via `product_asset_inventory` table
- **Freshness detection** using `is_outdated` flags + `captured_at` timestamps
- **Agentic AI** flags for missing assets, compliance reviews, auto-capture triggers

### Notes
- Removed hardcoded "production" sub-tab; replaced with "intent" as first step
- LANDING tab fully merged into CREATE's "assets" + messaging
- MANAGE tab fully merged into PRODUCE
- All 25+ pipelines still wire through, just reorganized in new 3-tab structure
- Master registry metrics untouched — will display in intent selector
