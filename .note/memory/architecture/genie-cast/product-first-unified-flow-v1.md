# Memory: architecture/genie-cast/product-first-unified-flow-v1
Updated: just now

## Product-First Unified Flow Architecture

### Problem Solved
Previously, CREATE/PRODUCE and LANDING operated as parallel silos. Scripts/TTS generated in LANDING were not reused in CREATE/PRODUCE, and product assets weren't filtered by product context.

### Schema Changes
- `regional_narration_scripts.product_id` (UUID FK → marketing_products.id, nullable)
- `tts_audio_versions.product_id` (UUID FK → marketing_products.id, nullable)
- Indexed: `(product_id, region_code, status)` and `(product_id, region_code)`

### Key Hook: `useProductContext(productId)`
Located: `src/hooks/useProductContext.ts`

Loads all related context for a selected product:
1. **Product metadata** from `marketing_products`
2. **Screenshots** from `product_asset_inventory` (non-outdated)
3. **Regional scripts** from `regional_narration_scripts` (latest version per region)
4. **TTS audio** from `tts_audio_versions`

Returns computed summary: asset counts, active/draft scripts, regions with TTS coverage, coverage percentage.

### Unified Flow
1. User selects product (e.g., Spark) → `useProductContext('spark-uuid')`
2. CREATE tab auto-loads product's brand assets + screenshots
3. LANDING scripts tagged with `product_id` are reused in PRODUCE Studio
4. Asset Lab outputs are tagged with `product_id` for cross-pipeline reuse
5. `useGenieCastSession` stores `selectedProductId` to persist across tabs

### Backward Compatibility
- `product_id` is nullable — existing scripts/TTS without a product tag continue to work
- LANDING tab can still operate without product context (global/marketing mode)

### Next Steps
- Add ProductSelector UI component at top of CREATE flow
- Wire `selectedProductId` into `useGenieCastSession`
- Update script generation to pass `product_id` during creation

Last Updated: 2026-02-13
