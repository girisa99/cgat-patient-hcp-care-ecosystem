

# Final Consolidated Plan: Genie Cast Full Pipeline Reconciliation
## (Updated with Google Places, Product-Region DB, 206 Pipelines via Dynamic Discovery)

---

## What This Plan Covers (Combined from All Previous Discussions)

This is the single master plan merging all four prior conversations:
1. Registry reconciliation (formats, sub-formats, categories)
2. Blueprint evolution (not deletion)
3. Dynamic capability discovery (all 206 pipelines)
4. Google Places enrichment per region/product
5. Product-to-region assignment with local language + English default
6. Single DB structure for the entire project across all regions
7. Multi-format PRODUCE adaptation

---

## Current Verified State (from DB queries just run)

| Entity | Count | Key Finding |
|--------|-------|-------------|
| Industry Categories | 18 | `cast_content_categories` |
| Media Formats | 8 | `cast_content_formats` -- needs expansion to 16 |
| Sub-Formats | 37 | `cast_content_sub_formats` -- needs ~25 more |
| Category-Format Links | **0** | `cast_category_formats` is EMPTY -- critical gap |
| Blueprints | 441 | `video_blueprints` -- has `product_id`, `region_code`, `language_code` but ALL are NULL |
| Blueprint Scenes | ~1,557 | `blueprint_scenes` -- structurally sound |
| Regional Scripts | 127 | `regional_narration_scripts` -- 87 regions, 40 languages, but `product_id` is NULL for all |
| Pipeline Categories | 21 | `CATEGORY_REGISTRY` in code (Spark:3, Mind:4, Vibe:6, Deck:3, Arc:2, Cast:3) |
| Pipeline Chains | 35 | C1-C35 in `PIPELINE_CHAINS` |
| Total Pipelines | 206 | Sum across 21 categories |
| Discovery Categories | 9 (hardcoded) | `capabilityDiscoveryEngine.ts` -- must become dynamic |
| `cast_projects` columns | Has `category_id`, `format_id`, `sub_format_id`, `input_language`, `output_languages`, `enrichment_snapshot` | Schema is ready but not populated by the UI flow |
| `marketing_products` | 8 system defaults (Spark, Mind, Vibe, Deck, Cast, Ask Genie, Suite, Hub) | Has `business_city/state/country/zipcode` -- location-aware but no region linkage |
| Google Places | Edge function `local-business-enrichment` deployed | Already integrated into `useUniversalEnrichment` via `enrichWithGooglePlaces()` |

---

## Architecture: Single DB, Multi-Region, Product-Scoped

The entire project uses **one Supabase database** for all regions. Regional data is stored using code-based columns, not separate databases:

```text
cast_projects
  +-- category_id      (industry: Healthcare, Finance, etc.)
  +-- format_id        (output: Video, PPT, Podcast, etc.)
  +-- sub_format_id    (leaf: Explainer, Investor Pitch, etc.)
  +-- target_regions   (text[] e.g. ['EU_DE', 'INDIA_NORTH', 'MENA_SA'])
  +-- selected_dialects(text[] e.g. ['de-DE', 'hi-IN', 'ar-SA'])
  +-- input_language   (text: source language, default 'en')
  +-- output_languages (text[]: all target languages)
  +-- enrichment_snapshot (jsonb: Google Places + brand intelligence)
  +-- product_context  (text: which product this content is for)

regional_narration_scripts
  +-- product_id       (FK to marketing_products -- needs population)
  +-- region_code      (e.g. 'EU_DE', 'INDIA_NORTH')
  +-- language_code    (e.g. 'de-DE', 'hi-IN')
  +-- is_english_base  (boolean: true for the source script)
  +-- english_base_script_id (FK: link back to English original)

video_blueprints
  +-- product_id       (FK to marketing_products -- exists but NULL)
  +-- region_code      (exists but NULL)
  +-- sub_region_code  (exists but NULL)
  +-- language_code    (exists but NULL)
```

**Key point**: English is ALWAYS the default/base. Every regional script has `is_english_base = true` for the original, and `english_base_script_id` pointing back to it for transcreations. Google Places enrichment is fetched once per product-location and stored in `enrichment_snapshot` on the `cast_projects` row.

---

## Phase 1: Registry Reconciliation and DB Expansion

### 1A. Expand Media Formats (8 to 16)

Add 8 missing parent formats to `cast_content_formats`:

| New Format | Label | requires_video | requires_tts |
|-----------|-------|---------------|-------------|
| website | Website / Landing Page | false | false |
| infographic | Infographic / Data Viz | false | false |
| training | Training / E-Learning | true | true |
| meeting_intelligence | Meeting Intelligence | false | false |
| email_campaign | Email / Newsletter | false | false |
| kids_education | Kids / Animation | true | true |
| event_content | Event / Recap | true | false |
| document | Whitepaper / Case Study | false | false |

### 1B. Expand Sub-Formats (~25 new entries)

Add sub-formats for each new parent format (3-5 each) plus fill gaps in existing formats:
- Video: add long_form, cinematic, animated, slide_deck_video, event_recap
- Podcast: add audio_drama, roundtable, q_and_a
- Presentation: add product_demo_deck, competitive_analysis, onboarding_deck
- Website: add landing_page, product_page, microsite, hero_banner, interactive_demo
- Training: add training_manual, course_series, e_learning_module, tutorial_series
- Meeting Intelligence: add meeting_recap, architecture_diagram, business_flow
- Email: add drip_campaign, newsletter, welcome_sequence
- And remaining new parents

### 1C. Populate Category-Format Links (currently 0 rows)

Insert rows into `cast_category_formats` linking all 18 industries to all 16 formats. This is 18 x 16 = 288 junction rows. Every industry can produce any format.

### 1D. Fix Pipeline Count References

- Update comment in `ecosystemRegistry.ts` from "181" to "206"
- Align `PIPELINE_CATEGORY_MAPPING` (currently 18 entries) with `CATEGORY_REGISTRY` (21 entries) by adding the 3 missing categories

**Files changed**: DB migration (formats, sub-formats, category-format links) + comment fix in `ecosystemRegistry.ts`

---

## Phase 2: Blueprint Evolution (Not Deletion)

### 2A. Add Format Linkage Columns to `video_blueprints`

The table already has `product_id`, `region_code`, `sub_region_code`, `language_code` -- but ALL are NULL for all 441 blueprints. Add:
- `format_id UUID REFERENCES cast_content_formats(id)`
- `sub_format_id UUID REFERENCES cast_content_sub_formats(id)`
- `supported_formats UUID[]` (for multi-format blueprints)
- `category_id UUID REFERENCES cast_content_categories(id)`

### 2B. Backfill All 441 Blueprints

SQL script to:
- Map 31 freetext `category` values to 18 standardized `cast_content_categories` IDs -> populate `category_id`
- Assign `format_id` based on blueprint type (most are "video", some are "presentation", "podcast", "webcast")
- Assign `product_id` from `marketing_products` system defaults (map by blueprint category/purpose)
- Set default `region_code` to 'NAM_US' and `language_code` to 'en-US' for the English base set
- Set `supported_formats` for versatile blueprints

### 2C. Style Override at Assignment Time

- Blueprint `style_intent` becomes a default suggestion
- User's CREATE selection overrides it via the existing `style_overrides` JSONB in `blueprint_assignments`
- No schema change needed for this

**Files changed**: DB migration (add columns) + data backfill script + `useVideoBlueprints.ts` (add format/category filter params)

---

## Phase 3: Dynamic Capability Discovery (All 206 Pipelines)

### 3A. Create `useCapabilityDiscoveryDynamic` Hook

New hook replacing the hardcoded 9-category engine:

1. Reads from `useCastContentRegistry` (18 industries, 16 formats, 60+ sub-formats from DB)
2. Maps the user's selection to `CATEGORY_REGISTRY` (21 pipeline categories) and `PIPELINE_CHAINS` (35 chains) to resolve which of the 206 pipelines activate
3. Shows which products are involved (e.g., Spark + Mind + Vibe icons)
4. Returns available output formats, estimated credits, and chain details

The mapping logic:
- Each sub-format maps to one or more pipeline categories from the 21 in `CATEGORY_REGISTRY`
- Each pipeline category belongs to a product (Spark, Mind, Vibe, Deck, Arc, Cast)
- The chain selector (`selectChain()` in `pipelineOrchestrator.ts`) resolves the best chain (C1-C35) based on intent + format + tier + Google Places availability
- All 206 individual pipelines within the activated categories become available

### 3B. Update `CreateDiscovery.tsx`

Replace the hardcoded 9-category grid with three cascading dropdowns (using existing `PortalDropdown`):

1. **Industry Category** -- single-select, 18 options from DB
2. **Media Format** -- multi-select, 16 options from DB
3. **Content Type / Sub-Format** -- multi-select, filtered by selected formats

Below the dropdowns, show a **dynamic results panel**:
- Which pipeline chains activate (from the 35 chains)
- Which products participate (from the 6 products)
- How many of the 206 pipelines are involved
- Available visual styles (filtered from 130+ registry)
- Google Places enrichment availability for selected region
- Estimated duration and credits

Keep existing 42-chain gallery as an "Advanced Pipeline Explorer" toggle.

### 3C. Update Session State in `useGenieCastSession`

Add fields (some already exist on `cast_projects` table but not in session hook):
- `selectedIndustryCategory: string | null` (category_id)
- `selectedFormats: string[]` (format_id array)
- `selectedContentTypes: string[]` (sub_format_id array)
- These persist across CREATE/PRODUCE/PUBLISH tabs

**Files changed**:
- New: `src/hooks/useCapabilityDiscoveryDynamic.ts`
- Modified: `src/components/create-flow/CreateDiscovery.tsx`
- Modified: `src/hooks/useGenieCastSession.ts`
- Modified: `src/services/capabilityDiscoveryEngine.ts` (add `getDynamicCategories()` fallback)

---

## Phase 4: Google Places + Product-Region Integration

### 4A. Google Places Per Product Per Region

The `local-business-enrichment` edge function and `enrichWithGooglePlaces()` already exist. What needs wiring:

1. When a `cast_project` is created, the user's selected `marketing_product` provides `business_city/state/country/zipcode`
2. Google Places is called with the product's location data
3. The result is stored in `cast_projects.enrichment_snapshot` (column already exists)
4. This snapshot flows into Universal Enrichment and is available to ALL downstream operations (scripts, TTS, video, PPT, etc.)
5. For multi-region projects, Google Places is called once for the product's HQ location -- the regional scripts use the enrichment data but transcreate to local language/culture

### 4B. Product Assignment to Cast Projects

Currently `cast_projects.product_context` is a TEXT field. The flow:

1. User selects a product from `marketing_products` during CREATE step
2. Product's `business_city/state/country` drives Google Places lookup
3. Product's `content_vertical` aligns with the selected industry category
4. `cast_projects.product_context` stores the product reference
5. `regional_narration_scripts.product_id` links each script to the product (column exists, currently NULL for all 127 scripts)

### 4C. Regional Script Generation with English Default

Each `cast_project` has:
- `input_language` (default: 'en') -- the base language
- `output_languages` (text[]) -- all target languages for transcreation
- `target_regions` (text[]) -- selected from the 82+ region hierarchy
- `selected_dialects` (text[]) -- specific dialects for TTS

Flow:
1. English base script generated first (using product context + Google Places enrichment + Universal Enrichment)
2. Stored in `regional_narration_scripts` with `is_english_base = true`
3. Transcreation to each target language via zone-routed LLMs (Anthropic for EU/LATAM/NAM, Alibaba for CJK/MENA, Gemini for India/SEA/Africa)
4. Each transcreated script stored with `english_base_script_id` pointing to the original
5. TTS generated per script using zone-routed providers (Azure for Western, CosyVoice for CJK, ElevenLabs for India/SEA/Africa)

**All in one DB** -- no separate databases per region. Region is a column, not a schema boundary.

### 4D. Batch Regional Generation Actions

Add to CREATE > Assets:
- "Generate All Regional Scripts" button: takes English base, transcreates to all `selected_dialects`
- "Generate All TTS" button: for each completed regional script, generates TTS via zone-routed providers
- Progress tracker showing X/Y regions complete

**Files changed**:
- Modified: `src/hooks/useGenieCastSession.ts` (wire product selection to Google Places)
- Modified: `src/components/create-flow/CreateFlowWizard.tsx` (product + region selection)
- Modified: `src/components/genie-admin/genie-cast/LandingPageScriptsPanel.tsx` (batch generation buttons)
- New: `src/components/genie-admin/genie-cast/RegionalCoverageMatrix.tsx`

---

## Phase 5: Multi-Format PRODUCE

### 5A. Format-Aware Generate Component

Replace hardcoded "Generate Video" card:
- Read `session.selectedFormats` from Cast session
- Show format-specific generation controls per format
- Visual style selector remains universal (applies to any format)

### 5B. Format Studio Router

New `FormatStudioRouter.tsx`:

| If Format Is | Editor Rendered |
|-------------|----------------|
| Video, Slide-deck video | Current timeline + scene editor (no change) |
| Presentation, Investor Pitch | Slide editor with per-slide video/animation embed |
| Podcast, Audio | Audio timeline + music/SFX layers |
| Video Podcast | Audio + avatar/visual overlay |
| Webcast | Slides + video overlay + live config |
| Website, Landing Page | Page section builder |
| Infographic | Canvas with motion keyframes |
| Training, E-Learning | Chapter/module editor |

Scene adaptability: a 5-scene blueprint renders differently per format (video scene = animated shot, PPT scene = slide with optional embedded video, podcast scene = narrated audio segment).

### 5C. Format-Specific Review Checklist

Update Review sub-tab to validate per format:
- Video: all scenes rendered, TTS synced
- PPT: all slides complete, optional videos embedded
- Podcast: audio mixed, intro/outro attached
- Website: all sections built, responsive preview passed

**Files changed**:
- New: `src/components/genie-admin/genie-cast/FormatStudioRouter.tsx`
- Modified: `src/components/genie-admin/genie-cast/GenieCastConsolidatedTabs.tsx`

---

## Phase 6: Review Gate and Publish Guard

### 6A. Approve for Publish Action

Add button in PRODUCE > Review:
- Sets `session.currentStage` to `'publishing'`
- Marks `approval` in `completedStages`
- Shows summary of what will be published (formats x regions x languages)

### 6B. Publish Tab Guard

In `GenieCastConsolidatedTabs.tsx`:
- If `approval` not in `completedStages`, show disabled state with message
- Enable PUBLISH sub-tabs only after approval

**Files changed**:
- Modified: `src/components/genie-admin/genie-cast/GenieCastConsolidatedTabs.tsx`
- Modified: `src/hooks/useGenieCastSession.ts`

---

## Phase 7: Regional Coverage Dashboard

Reusable `RegionalCoverageMatrix` component:
- Rows = selected regions/sub-regions from session
- Columns = Script status, TTS status, Asset status, Generation status
- Color coded: green (complete), amber (in progress), red (missing)
- Used in CREATE > Assets, PRODUCE > Studio, and PRODUCE > Review

**Files changed**:
- New: `src/components/genie-admin/genie-cast/RegionalCoverageMatrix.tsx`

---

## Implementation Priority

| Order | Phase | What | Effort |
|-------|-------|------|--------|
| 1 | Phase 1 | Registry: expand formats 8->16, sub-formats 37->62, populate 288 category-format links | Medium |
| 2 | Phase 2 | Blueprints: add format/category columns, backfill 441 records | Medium |
| 3 | Phase 6 | Review gate + publish guard (quick win, enforces flow) | Low |
| 4 | Phase 3 | Dynamic discovery: replace 9 hardcoded categories with DB-driven 18+16+62 + 206 pipeline resolution | High |
| 5 | Phase 4 | Google Places + product-region wiring + batch regional generation | Medium |
| 6 | Phase 7 | Regional coverage dashboard | Medium |
| 7 | Phase 5 | Multi-format PRODUCE (slide editor, audio timeline, etc.) | High |

---

## What We Do NOT Build

- No separate databases per region (single DB, region is a column)
- No new edge functions (reuse `local-business-enrichment`, `universal-scene-orchestrator`, `ai-universal-processor`, `guide-tts`)
- No new services for messaging (Universal Enrichment handles it)
- No duplicate pipeline registries (extend existing `CATEGORY_REGISTRY` + `PIPELINE_CHAINS`)
- No deletion of 441 blueprints (evolve with new columns + backfill)
- No workspace-scoped features (user-scoped only per governance)
- No hardcoded discovery categories (everything from DB)

---

## Technical Summary

```text
DB (single database)
 |
 +-- cast_content_categories (18 industries)
 +-- cast_content_formats (8 -> 16 formats)
 +-- cast_content_sub_formats (37 -> 62 sub-formats)
 +-- cast_category_formats (0 -> 288 junction rows)
 |
 +-- marketing_products (product + location for Google Places)
 |     +-- business_city/state/country/zipcode
 |
 +-- cast_projects (one project = one campaign)
 |     +-- category_id -> industry
 |     +-- format_id -> primary format
 |     +-- sub_format_id -> content type
 |     +-- target_regions[] -> 82+ region codes
 |     +-- selected_dialects[] -> languages for TTS
 |     +-- input_language -> 'en' default
 |     +-- output_languages[] -> transcreation targets
 |     +-- enrichment_snapshot -> Google Places + brand data
 |
 +-- video_blueprints (441, evolve not delete)
 |     +-- format_id (NEW)
 |     +-- sub_format_id (NEW)
 |     +-- supported_formats (NEW)
 |     +-- category_id (NEW)
 |     +-- product_id (EXISTS, needs backfill)
 |     +-- region_code (EXISTS, needs backfill)
 |
 +-- regional_narration_scripts (127, needs product_id population)
 |     +-- product_id -> marketing_products
 |     +-- region_code + language_code
 |     +-- is_english_base + english_base_script_id
 |
 +-- Code: CATEGORY_REGISTRY (21 categories, 206 pipelines)
 +-- Code: PIPELINE_CHAINS (35 chains, C1-C35)
 +-- Code: useCapabilityDiscoveryDynamic (NEW - replaces hardcoded 9)
 +-- Code: selectChain(intent, format, tier, hasGooglePlaces)
```

